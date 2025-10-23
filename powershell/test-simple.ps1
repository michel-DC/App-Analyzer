param(
    [string]$Url = "https://nassimessid.fr"
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ANALYSE WEB - APP ANALYZER" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "URL: $Url" -ForegroundColor White
Write-Host "`nLancement de l'analyse (10-30 secondes)...`n" -ForegroundColor Yellow

$body = @{
    url = $Url
    options = @{
        lighthouse = $true
    }
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/analyze" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 120
    
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  RESULTATS" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Green
    
    if ($response.status -eq "success") {
        Write-Host "[OK] Analyse reussie" -ForegroundColor Green
        
        Write-Host "`n--- SCORE GLOBAL ---" -ForegroundColor Cyan
        $scoreColor = if($response.score -ge 90){'Green'}elseif($response.score -ge 75){'Yellow'}elseif($response.score -ge 50){'DarkYellow'}else{'Red'}
        Write-Host "Score: $($response.score)/100" -ForegroundColor $scoreColor
        
        Write-Host "`n--- SCORES PAR CATEGORIE ---" -ForegroundColor Cyan
        Write-Host "SEO: $($response.categories.seo)/100"
        Write-Host "Performance: $($response.categories.performance)/100"
        $accScore = if($response.categories.accessibility -eq -1){"N/A"}else{"$($response.categories.accessibility)/100"}
        Write-Host "Accessibilite: $accScore"
        $bpScore = if($response.categories.bestPractices -eq -1){"N/A"}else{"$($response.categories.bestPractices)/100"}
        Write-Host "Bonnes Pratiques: $bpScore"
        
        Write-Host "`n--- INFORMATIONS SITE ---" -ForegroundColor Cyan
        Write-Host "Type: $($response.siteType)"
        Write-Host "Titre: $($response.pageInfo.title)"
        Write-Host "H1: $($response.pageInfo.firstH1)"
        
        if ($response.detectedTechnologies.Count -gt 0) {
            $techNames = ($response.detectedTechnologies | ForEach-Object { $_.name }) -join ", "
            Write-Host "Technologies: $techNames"
        }
        
        $lhStatus = if($response.lighthouseExecuted){"Oui"}else{"Non (desactive en dev)"}
        Write-Host "Lighthouse execute: $lhStatus"
        
        Write-Host "`n--- RESUME ---" -ForegroundColor Cyan
        Write-Host "$($response.shortSummary)" -ForegroundColor White
        
        if ($response.siteTypeAdvice) {
            Write-Host "`n--- CONSEIL SPECIFIQUE ---" -ForegroundColor Cyan
            Write-Host "$($response.siteTypeAdvice)" -ForegroundColor White
        }
        
        Write-Host "`n--- PROBLEMES DETECTES ($($response.issues.Count)) ---" -ForegroundColor Cyan
        
        if ($response.issues.Count -gt 0) {
            $criticalCount = ($response.issues | Where-Object { $_.severity -eq "high" }).Count
            $mediumCount = ($response.issues | Where-Object { $_.severity -eq "medium" }).Count
            $lowCount = ($response.issues | Where-Object { $_.severity -eq "low" }).Count
            
            Write-Host "Critiques: $criticalCount | Moyens: $mediumCount | Faibles: $lowCount`n" -ForegroundColor Yellow
            
            foreach ($issue in $response.issues) {
                $severityLabel = $issue.severity.ToUpper()
                $color = switch($issue.severity) {
                    "high" { "Red" }
                    "medium" { "Yellow" }
                    default { "Green" }
                }
                
                Write-Host "[$severityLabel] $($issue.type)" -ForegroundColor $color
                Write-Host "   $($issue.message)" -ForegroundColor White
                
                if ($issue.description -and $issue.description.Length -gt 0) {
                    $shortDesc = if($issue.description.Length -gt 150) {
                        $issue.description.Substring(0, 150) + "..."
                    } else {
                        $issue.description
                    }
                    Write-Host "   > $shortDesc" -ForegroundColor DarkGray
                }
                
                if ($issue.action -and $issue.action.Length -gt 0) {
                    Write-Host "   ACTION: $($issue.action)" -ForegroundColor Green
                }
                
                Write-Host ""
            }
        } else {
            Write-Host "Aucun probleme detecte!" -ForegroundColor Green
        }
        
        if ($response.quickWins -and $response.quickWins.Count -gt 0) {
            Write-Host "`n--- QUICK WINS (Actions rapides) ---" -ForegroundColor Cyan
            foreach ($qw in $response.quickWins) {
                $lines = $qw -split "`n"
                Write-Host "`n* $($lines[0])" -ForegroundColor Green
                if ($lines.Count -gt 1) {
                    for ($i = 1; $i -lt [Math]::Min($lines.Count, 3); $i++) {
                        if ($lines[$i].Trim()) {
                            Write-Host "  $($lines[$i])" -ForegroundColor DarkGray
                        }
                    }
                }
            }
        }
        
        Write-Host "`n--- RECOMMANDATIONS PRINCIPALES ---" -ForegroundColor Cyan
        
        if ($response.detailedRecommendations -and $response.detailedRecommendations.Count -gt 0) {
            foreach ($rec in $response.detailedRecommendations) {
                $priorityLabel = $rec.priority.ToUpper()
                Write-Host "`n[$priorityLabel] $($rec.title)" -ForegroundColor Yellow
                Write-Host "  Temps estime: $($rec.estimatedTime)" -ForegroundColor Cyan
                Write-Host "  Impact: $($rec.impact)" -ForegroundColor White
                
                $shortDesc = if($rec.description.Length -gt 200) {
                    $rec.description.Substring(0, 200) + "..."
                } else {
                    $rec.description
                }
                Write-Host "  Description: $shortDesc" -ForegroundColor DarkGray
            }
        } else {
            foreach ($rec in $response.recommendations) {
                Write-Host "* $rec" -ForegroundColor White
            }
        }
        
        Write-Host "`n========================================" -ForegroundColor Cyan
        Write-Host "  JSON COMPLET" -ForegroundColor Cyan
        Write-Host "========================================`n" -ForegroundColor Cyan
        
        $response | ConvertTo-Json -Depth 20
        
    } else {
        Write-Host "[ERREUR] Echec de l'analyse" -ForegroundColor Red
        Write-Host "Message: $($response.message)" -ForegroundColor Red
        
        Write-Host "`n========================================" -ForegroundColor Cyan
        Write-Host "  JSON COMPLET" -ForegroundColor Cyan
        Write-Host "========================================`n" -ForegroundColor Cyan
        
        $response | ConvertTo-Json -Depth 20
    }
    
    Write-Host "`n[OK] Analyse terminee`n" -ForegroundColor Green
    
} catch {
    Write-Host "`n[ERREUR] Connexion impossible" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nVerifiez que le serveur est demarre avec 'pnpm dev'`n" -ForegroundColor Yellow
    exit 1
}

