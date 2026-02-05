param([string]$Key = "a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6`x00`x1a`x7f`x02`x05`x0e`x1b`x0c`x0d`x11`x13`x15`x17`x19`x1d")

# RNK Enterprise Protection Pipeline - File-by-File Obfuscation + Encryption

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$protectedDir = "$scriptDir\protected"
$BuildLog = "$scriptDir\build-protected.log"

function Write-Log($msg) { Write-Host $msg; Add-Content $BuildLog $msg }
function Start-Log { "=== Protection Build Started $(Get-Date) ===" | Set-Content $BuildLog }

Start-Log

if(-not (Test-Path $protectedDir)) { New-Item $protectedDir -ItemType Directory | Out-Null }

$filesToProtect = @(
    "scripts/module.js",
    "scripts/constants.js",
    "scripts/utils.js",
    "scripts/settings.js",
    "scripts/config.js",
    "scripts/hooks.js",
    "scripts/styles.js",
    "scripts/features/animation.js",
    "scripts/features/presets.js",
    "scripts/features/export-import.js"
)

function Obfuscate-Code($code) {
    $shorts = @("_a","_b","_c","_d","_e","_f","_g","_h","_i","_j","_k","_l","_m","_n","_o","_p","_q","_r","_s","_t","_u","_v","_w","_x","_y","_z")
    $varMap = @{}
    $count = 0
    
    $pattern = '[a-zA-Z_][a-zA-Z0-9_]*'
    $matches = [regex]::Matches($code, $pattern) | Select-Object -Unique Value
    
    foreach($match in $matches) {
        $var = $match.Value
        if($var -and -not $varMap.ContainsKey($var) -and $var.Length -gt 3) {
            $varMap[$var] = $shorts[$count % $shorts.Count]
            $count++
        }
    }
    
    $obf = $code
    foreach($k in $varMap.Keys) {
        $obf = $obf -replace "\b$k\b", $varMap[$k]
    }
    return $obf
}

function Minify-Code($code) {
    $min = $code -replace '//.*$', '' -replace '/\*[\s\S]*?\*/', ''
    $min = $min -replace '\s+', ' ' -replace '\s*([{};:,=()[\]])\s*', '$1'
    $min = $min -replace ';\s*}', '}' -replace 'function\s+', 'function '
    return $min.Trim()
}

function Opacity-Code($code) {
    $opaque = $code -replace '^\s*//.*$', '' -replace '/\*.*?\*/', ''
    $opaque = $opaque -replace '\s+//.*', '' -replace '\n\s*\n', "`n"
    return $opaque
}

function Encrypt-Code($code, $key) {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($code)
    $keyBytes = [System.Text.Encoding]::UTF8.GetBytes($key)
    [System.Security.Cryptography.RNGCryptoServiceProvider] $rng = New-Object System.Security.Cryptography.RNGCryptoServiceProvider
    $iv = New-Object byte[] 16
    $rng.GetBytes($iv)
    
    $aes = [System.Security.Cryptography.Aes]::Create()
    $aes.Key = $keyBytes
    $aes.IV = $iv
    
    $encryptor = $aes.CreateEncryptor()
    $encrypted = $encryptor.TransformFinalBlock($bytes, 0, $bytes.Length)
    $encryptor.Dispose()
    $aes.Dispose()
    
    $combined = $iv + $encrypted
    return [Convert]::ToBase64String($combined)
}

foreach($file in $filesToProtect) {
    $fullPath = "$scriptDir\$file"
    if(-not (Test-Path $fullPath)) { 
        Write-Log "SKIP: $file (not found)"
        continue 
    }
    
    $code = Get-Content $fullPath -Raw
    
    Write-Log "PROTECT: $file"
    Write-Log "  -> Obfuscating..."
    $code = Obfuscate-Code $code
    
    Write-Log "  -> Minifying..."
    $code = Minify-Code $code
    
    Write-Log "  -> Making Opaque..."
    $code = Opacity-Code $code
    
    Write-Log "  -> Encrypting (AES-256)..."
    $encrypted = Encrypt-Code $code $Key
    
    $outFile = "$protectedDir\$(Split-Path $file -Leaf).enc"
    $encrypted | Set-Content $outFile
    
    $size = (Get-Item $fullPath).Length
    $encSize = (Get-Item $outFile).Length
    Write-Log "  -> Encrypted: $($encSize)B ($([math]::Round($encSize/$size*100, 1))% original)"
}

Write-Log "=== Build Complete ==="
Write-Log "Protected files: $protectedDir"
Write-Log "Key: (32-byte sophisticated key with hidden characters)"
