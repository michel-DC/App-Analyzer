param(
    [string]$Site1 = "https://onlinemichel.dev",
    [string]$Site2 = "https://nassimessid.fr"
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST ANALYSE SEQUENTIELLE - 2 SITES" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Site 1: $Site1" -ForegroundColor White
Write-Host "Site 2: $Site2" -ForegroundColor White
Write-Host "`nLancement des analyses SEQUENTIELLEMENT...`n" -ForegroundColor Yellow

# Fonction pour analyser un site
function Analyze-Site {
    param(
        [string]$Url,
        [string]$SiteName
    )
    
    $body = @{
        url = $Url
        options = @{
            lighthouse = $true
            rowId = "test_$SiteName"
        }
    } | ConvertTo-Json

    try {
        Write-Host "[$SiteName] Demarrage de l'analyse..." -ForegroundColor Yellow
        $startTime = Get-Date
        
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/analyze" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 120
        
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalSeconds
        
        return @{
            SiteName = $SiteName
            Url = $Url
            Success = $true
            Response = $response
            Duration = $duration
            StartTime = $startTime
            EndTime = $endTime
        }
    } catch {
        Write-Host "[$SiteName] ERREUR: $($_.Exception.Message)" -ForegroundColor Red
        return @{
            SiteName = $SiteName
            Url = $Url
            Success = $false
            Error = $_.Exception.Message
            StartTime = Get-Date
        }
    }
}

# Lancement des analyses SÉQUENTIELLEMENT
Write-Host "Debut des analyses: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan

$results = @()

# Analyse du premier site
Write-Host "`n--- ANALYSE SITE 1 ---" -ForegroundColor Magenta
$result1 = Analyze-Site -Url $Site1 -SiteName "SITE1"
$results += $result1

# Attendre un peu entre les analyses
Write-Host "`nAttente de 2 secondes avant la prochaine analyse..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Analyse du deuxième site
Write-Host "`n--- ANALYSE SITE 2 ---" -ForegroundColor Magenta
$result2 = Analyze-Site -Url $Site2 -SiteName "SITE2"
$results += $result2

$totalStartTime = $results[0].StartTime
$totalEndTime = $results[-1].EndTime
$totalDuration = ($totalEndTime - $totalStartTime).TotalSeconds

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  RESULTATS SEQUENTIELS" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Duree totale: $([Math]::Round($totalDuration, 2)) secondes" -ForegroundColor Cyan
Write-Host ""

foreach ($result in $results) {
    Write-Host "--- $($result.SiteName) ---" -ForegroundColor Cyan
    Write-Host "URL: $($result.Url)" -ForegroundColor White
    
    if ($result.Success) {
        Write-Host "Status: SUCCES" -ForegroundColor Green
        Write-Host "Duree: $([Math]::Round($result.Duration, 2)) secondes" -ForegroundColor Green
        
        if ($result.Response.status -eq "success") {
            Write-Host "Score global: $($result.Response.score)/100" -ForegroundColor Green
            
            Write-Host "Scores par categorie:" -ForegroundColor Yellow
            Write-Host "  SEO: $($result.Response.categories.seo)/100"
            Write-Host "  Performance: $($result.Response.categories.performance)/100"
            
            $accScore = if($result.Response.categories.accessibility -eq -1){"N/A"}else{"$($result.Response.categories.accessibility)/100"}
            Write-Host "  Accessibilite: $accScore"
            
            $bpScore = if($result.Response.categories.bestPractices -eq -1){"N/A"}else{"$($result.Response.categories.bestPractices)/100"}
            Write-Host "  Bonnes Pratiques: $bpScore"
            
            Write-Host "Titre: $($result.Response.pageInfo.title)" -ForegroundColor White
            Write-Host "Issues detectees: $($result.Response.issues.Count)" -ForegroundColor Yellow
            
            # Vérifier si Lighthouse a fonctionné COMPLÈTEMENT
            $lighthouseComplete = $result.Response.categories.performance -gt 0 -and 
                                 $result.Response.categories.seo -gt 0 -and 
                                 $result.Response.categories.accessibility -gt 0 -and 
                                 $result.Response.categories.bestPractices -gt 0
            
            if ($lighthouseComplete) {
                Write-Host "Lighthouse: ✅ COMPLET (4/4 scores)" -ForegroundColor Green
            } else {
                $lighthousePartial = $result.Response.categories.performance -gt 0 -and $result.Response.categories.seo -gt 0
                if ($lighthousePartial) {
                    Write-Host "Lighthouse: ⚠️  PARTIEL (2/4 scores)" -ForegroundColor Yellow
                } else {
                    Write-Host "Lighthouse: ❌ ECHEC" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "Erreur d'analyse: $($result.Response.message)" -ForegroundColor Red
        }
    } else {
        Write-Host "Status: ECHEC" -ForegroundColor Red
        Write-Host "Erreur: $($result.Error)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Analyse comparative
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  ANALYSE COMPARATIVE" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

$successfulResults = $results | Where-Object { $_.Success -and $_.Response.status -eq "success" }

if ($successfulResults.Count -eq 2) {
    Write-Host "✅ Les deux analyses ont reussi!" -ForegroundColor Green
    
    $site1Result = $successfulResults | Where-Object { $_.SiteName -eq "SITE1" }
    $site2Result = $successfulResults | Where-Object { $_.SiteName -eq "SITE2" }
    
    Write-Host "`nComparaison des scores:" -ForegroundColor Cyan
    Write-Host "Site 1 ($($site1Result.Url)): $($site1Result.Response.score)/100" -ForegroundColor White
    Write-Host "Site 2 ($($site2Result.Url)): $($site2Result.Response.score)/100" -ForegroundColor White
    
    $betterSite = if($site1Result.Response.score -gt $site2Result.Response.score) { "Site 1" } else { "Site 2" }
    Write-Host "Meilleur score: $betterSite" -ForegroundColor Green
    
    Write-Host "`nComparaison des durees:" -ForegroundColor Cyan
    Write-Host "Site 1: $([Math]::Round($site1Result.Duration, 2))s" -ForegroundColor White
    Write-Host "Site 2: $([Math]::Round($site2Result.Duration, 2))s" -ForegroundColor White
    
    $fasterSite = if($site1Result.Duration -lt $site2Result.Duration) { "Site 1" } else { "Site 2" }
    Write-Host "Plus rapide: $fasterSite" -ForegroundColor Green
    
    # Vérifier si Lighthouse a fonctionné COMPLÈTEMENT pour les deux
    $lighthouse1Complete = $site1Result.Response.categories.accessibility -gt 0 -and $site1Result.Response.categories.bestPractices -gt 0
    $lighthouse2Complete = $site2Result.Response.categories.accessibility -gt 0 -and $site2Result.Response.categories.bestPractices -gt 0
    
    if ($lighthouse1Complete -and $lighthouse2Complete) {
        Write-Host "`n✅ Lighthouse a fonctionne COMPLETEMENT pour les deux sites!" -ForegroundColor Green
        Write-Host "   (Tous les scores: SEO, Performance, Accessibilité, Bonnes Pratiques)" -ForegroundColor Green
    } elseif ($lighthouse1Complete -or $lighthouse2Complete) {
        Write-Host "`n⚠️  Lighthouse a fonctionne COMPLETEMENT pour un seul site" -ForegroundColor Yellow
    } else {
        Write-Host "`n❌ Lighthouse a echoue pour les deux sites" -ForegroundColor Red
    }
    
} elseif ($successfulResults.Count -eq 1) {
    Write-Host "⚠️  Une seule analyse a reussi" -ForegroundColor Yellow
} else {
    Write-Host "❌ Aucune analyse n'a reussi" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  JSON COMPLETS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

foreach ($result in $results) {
    if ($result.Success) {
        Write-Host "--- $($result.SiteName) JSON ---" -ForegroundColor Cyan
        $result.Response | ConvertTo-Json -Depth 10
        Write-Host "`n"
    }
}

Write-Host "`n[OK] Test sequentiel termine`n" -ForegroundColor Green
