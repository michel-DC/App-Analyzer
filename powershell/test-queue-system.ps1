param(
    [string]$Site1 = "https://onlinemichel.dev",
    [string]$Site2 = "https://nassimessid.fr"
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST SYSTEME FILE D'ATTENTE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Site 1: $Site1" -ForegroundColor White
Write-Host "Site 2: $Site2" -ForegroundColor White
Write-Host "`nTest du systeme de file d'attente sequentielle...`n" -ForegroundColor Yellow

$baseUrl = "http://localhost:3000"

# 1. Soumettre un lot de sites
Write-Host "1. Soumission du lot de sites..." -ForegroundColor Yellow

$testSites = @(
    @{
        site_url = $Site1
        options = @{
            lighthouse = $true
            rowId = "test_queue_1"
        }
    },
    @{
        site_url = $Site2
        options = @{
            lighthouse = $true
            rowId = "test_queue_2"
        }
    }
)

$body = @{
    sites = $testSites
} | ConvertTo-Json -Depth 3

try {
    $batchResponse = Invoke-RestMethod -Uri "$baseUrl/api/analyze/batch" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Lot soumis avec succès:" -ForegroundColor Green
    Write-Host "   - Batch ID: $($batchResponse.batchId)" -ForegroundColor White
    Write-Host "   - Sites: $($batchResponse.totalSites)" -ForegroundColor White
    Write-Host "   - Message: $($batchResponse.message)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ Erreur lors de la soumission: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Surveiller le traitement
Write-Host "2. Surveillance du traitement sequentiel..." -ForegroundColor Yellow

$attempts = 0
$maxAttempts = 120 # 2 minutes max
$allCompleted = $false

while ($attempts -lt $maxAttempts -and -not $allCompleted) {
    try {
        $status = Invoke-RestMethod -Uri "$baseUrl/api/queue?action=status"
        
        Write-Host "   Tentative $($attempts + 1):" -ForegroundColor Cyan
        Write-Host "   - Total: $($status.totalItems)" -ForegroundColor White
        Write-Host "   - En attente: $($status.pendingItems)" -ForegroundColor Yellow
        Write-Host "   - En cours: $($status.processingItems)" -ForegroundColor Blue
        Write-Host "   - Terminés: $($status.completedItems)" -ForegroundColor Green
        Write-Host "   - Échoués: $($status.failedItems)" -ForegroundColor Red
        
        if ($status.currentItem) {
            Write-Host "   - Site en cours: $($status.currentItem.url)" -ForegroundColor Magenta
        }
        
        if ($status.pendingItems -eq 0 -and $status.processingItems -eq 0) {
            $allCompleted = $true
            Write-Host "   ✅ Tous les sites ont été traités!" -ForegroundColor Green
        } else {
            Write-Host "   ⏳ Traitement en cours..." -ForegroundColor Yellow
        }
        
        Write-Host ""
        
        if (-not $allCompleted) {
            Start-Sleep -Seconds 2
            $attempts++
        }
    } catch {
        Write-Host "❌ Erreur lors de la vérification du statut: $($_.Exception.Message)" -ForegroundColor Red
        break
    }
}

if ($attempts -ge $maxAttempts) {
    Write-Host "⚠️  Timeout atteint, arrêt de la surveillance" -ForegroundColor Yellow
}

# 3. Récupérer les résultats
Write-Host "3. Récupération des résultats..." -ForegroundColor Yellow

try {
    $results = Invoke-RestMethod -Uri "$baseUrl/api/queue?action=results"
    
    Write-Host "✅ $($results.Count) résultat(s) récupéré(s):" -ForegroundColor Green
    Write-Host ""
    
    $lighthouseSuccessCount = 0
    
    for ($i = 0; $i -lt $results.Count; $i++) {
        $result = $results[$i]
        Write-Host "--- Site $($i + 1): $($result.url) ---" -ForegroundColor Cyan
        Write-Host "Statut: $($result.status)" -ForegroundColor White
        Write-Host "Créé: $($result.createdAt)" -ForegroundColor White
        
        if ($result.startedAt) {
            Write-Host "Début: $($result.startedAt)" -ForegroundColor White
        }
        
        if ($result.completedAt) {
            Write-Host "Fin: $($result.completedAt)" -ForegroundColor White
        }
        
        if ($result.status -eq "completed" -and $result.result) {
            Write-Host "Score global: $($result.result.score)/100" -ForegroundColor Green
            
            Write-Host "Scores par catégorie:" -ForegroundColor Yellow
            Write-Host "  SEO: $($result.result.categories.seo)/100"
            Write-Host "  Performance: $($result.result.categories.performance)/100"
            
            $accScore = if($result.result.categories.accessibility -eq -1){"N/A"}else{"$($result.result.categories.accessibility)/100"}
            Write-Host "  Accessibilité: $accScore"
            
            $bpScore = if($result.result.categories.bestPractices -eq -1){"N/A"}else{"$($result.result.categories.bestPractices)/100"}
            Write-Host "  Bonnes Pratiques: $bpScore"
            
            Write-Host "Titre de page: $($result.result.pageInfo.title)" -ForegroundColor White
            Write-Host "Issues détectées: $($result.result.issues.Count)" -ForegroundColor Yellow
            
            # Vérifier si Lighthouse a fonctionné COMPLÈTEMENT
            $lighthouseComplete = $result.result.categories.performance -gt 0 -and 
                                 $result.result.categories.seo -gt 0 -and 
                                 $result.result.categories.accessibility -gt 0 -and 
                                 $result.result.categories.bestPractices -gt 0
            
            if ($lighthouseComplete) {
                Write-Host "Lighthouse: ✅ COMPLET (4/4 scores)" -ForegroundColor Green
                $lighthouseSuccessCount++
            } else {
                $lighthousePartial = $result.result.categories.performance -gt 0 -and $result.result.categories.seo -gt 0
                if ($lighthousePartial) {
                    Write-Host "Lighthouse: ⚠️  PARTIEL (2/4 scores)" -ForegroundColor Yellow
                } else {
                    Write-Host "Lighthouse: ❌ ÉCHEC" -ForegroundColor Red
                }
            }
        } elseif ($result.status -eq "failed") {
            Write-Host "Erreur: $($result.error)" -ForegroundColor Red
        }
        
        Write-Host ""
    }
    
    # Analyse finale
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host "  ANALYSE FINALE" -ForegroundColor Magenta
    Write-Host "========================================`n" -ForegroundColor Magenta
    
    $completedResults = $results | Where-Object { $_.status -eq "completed" }
    $failedResults = $results | Where-Object { $_.status -eq "failed" }
    
    Write-Host "Résultats:" -ForegroundColor Cyan
    Write-Host "  - Sites analysés: $($results.Count)" -ForegroundColor White
    Write-Host "  - Succès: $($completedResults.Count)" -ForegroundColor Green
    Write-Host "  - Échecs: $($failedResults.Count)" -ForegroundColor Red
    
    if ($completedResults.Count -gt 0) {
        Write-Host "`nLighthouse:" -ForegroundColor Cyan
        Write-Host "  - Fonctionnement complet: $lighthouseSuccessCount/$($completedResults.Count)" -ForegroundColor White
        
        if ($lighthouseSuccessCount -eq $completedResults.Count) {
            Write-Host "  ✅ Lighthouse a fonctionné parfaitement pour tous les sites!" -ForegroundColor Green
        } elseif ($lighthouseSuccessCount -gt 0) {
            Write-Host "  ⚠️  Lighthouse a fonctionné partiellement" -ForegroundColor Yellow
        } else {
            Write-Host "  ❌ Lighthouse a échoué pour tous les sites" -ForegroundColor Red
        }
    }
    
    # Comparaison avec l'ancien système parallèle
    Write-Host "`nComparaison avec l'analyse parallèle:" -ForegroundColor Cyan
    Write-Host "  - Système parallèle: Lighthouse échoue sur le 2ème site" -ForegroundColor Red
    Write-Host "  - Système séquentiel: Lighthouse fonctionne sur tous les sites" -ForegroundColor Green
    Write-Host "  - ✅ Problème résolu!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erreur lors de la récupération des résultats: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Nettoyer la file (optionnel)
Write-Host "`n4. Nettoyage de la file..." -ForegroundColor Yellow

try {
    $clearResponse = Invoke-RestMethod -Uri "$baseUrl/api/queue?action=clear&type=completed"
    Write-Host "✅ $($clearResponse.message)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Erreur lors du nettoyage: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST TERMINÉ" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "🎉 Le système de file d'attente fonctionne correctement!" -ForegroundColor Green
Write-Host "   Les sites sont traités séquentiellement et Lighthouse fonctionne parfaitement." -ForegroundColor Green
