& {
Set-Location "C:\Users\y_m_a\Projects\wuld-ink"
Remove-Item ".git\*.lock" -Force -ErrorAction SilentlyContinue
function Md5($p){ (Get-FileHash -Algorithm MD5 -Path $p).Hash.ToLower() }
git fetch origin 2>$null | Out-Null
$head = (git rev-parse HEAD).Trim(); $orig = (git rev-parse origin/main).Trim(); $lr = (git ls-remote origin main).Split()[0]
if ($head -ne "8ec892543915ada2e2d21c506a147cca7933b7f3") { throw "FAIL HEAD guard: $head" }
if ($orig -ne $head -or $lr -ne $head) { throw "FAIL origin/one-committer guard: origin=$orig lsremote=$lr" }
# --- base-MD5 guards (32) ---
if ((Md5 "src\components\yurei.js") -ne "2686a1a9881cc03af61c5d1daec0be68") { throw "FAIL base src/components/yurei.js" }
if ((Md5 "src\components\yurei-assistant.js") -ne "294359ea5159129db2355161475324f3") { throw "FAIL base src/components/yurei-assistant.js" }
if ((Md5 "src\components\nav.js") -ne "a5b189866ce515b72338aef1c6b0805f") { throw "FAIL base src/components/nav.js" }
if ((Md5 "CLAUDE.md") -ne "28235bc66c8b283e2b9b257dfd651a4d") { throw "FAIL base CLAUDE.md" }
if ((Md5 "src\blog\index.html") -ne "6ddb7f7f58698a7091547e7807028d89") { throw "FAIL base src/blog/index.html" }
if ((Md5 "src\book\index.html") -ne "c5900c5a6582f0c072662b556673c202") { throw "FAIL base src/book/index.html" }
if ((Md5 "src\essays\alogically-is\index.html") -ne "96414a405839ccd1bd250437d7dbe11c") { throw "FAIL base src/essays/alogically-is/index.html" }
if ((Md5 "src\essays\architecture-of-moral-disaster\index.html") -ne "b2965d000eb2aca1e7c32162ba667515") { throw "FAIL base src/essays/architecture-of-moral-disaster/index.html" }
if ((Md5 "src\essays\sanguinolentum-vestigium\index.html") -ne "cbb0672880573201e02d0fdf07d9c298") { throw "FAIL base src/essays/sanguinolentum-vestigium/index.html" }
if ((Md5 "src\frame\index.html") -ne "ccabd55337298611291e6c75e564d119") { throw "FAIL base src/frame/index.html" }
if ((Md5 "src\glossary\alogical-isness\index.html") -ne "289ceedeac6538f703a29312cc8f865a") { throw "FAIL base src/glossary/alogical-isness/index.html" }
if ((Md5 "src\glossary\anfractuous-aporia\index.html") -ne "2cb30feca75eb8551aac2fea9655b20b") { throw "FAIL base src/glossary/anfractuous-aporia/index.html" }
if ((Md5 "src\glossary\cascade-math-safeguard\index.html") -ne "ccd2f844c253f9bdc745b096986732f3") { throw "FAIL base src/glossary/cascade-math-safeguard/index.html" }
if ((Md5 "src\glossary\censorship-reversal-trap-door\index.html") -ne "8e79b4b6cae0acfe5f0e89a7ecad1aa4") { throw "FAIL base src/glossary/censorship-reversal-trap-door/index.html" }
if ((Md5 "src\glossary\contextus-claudit\index.html") -ne "255f398bf3b315bf4fd6d97986d033b3") { throw "FAIL base src/glossary/contextus-claudit/index.html" }
if ((Md5 "src\glossary\empirical-asymmetry-argument\index.html") -ne "f4dfd04a03b587edbe2259a40b7a9c7e") { throw "FAIL base src/glossary/empirical-asymmetry-argument/index.html" }
if ((Md5 "src\glossary\foundational-fork\index.html") -ne "f2dbc14078cbae3c1baf7595f9f0d03a") { throw "FAIL base src/glossary/foundational-fork/index.html" }
if ((Md5 "src\glossary\framework-vs-actor-distinction\index.html") -ne "d3a225726b0bd2edefd3b0bfb9e2edb6") { throw "FAIL base src/glossary/framework-vs-actor-distinction/index.html" }
if ((Md5 "src\glossary\labor-sine-fructu\index.html") -ne "143b035db29863adc40525d594de8edc") { throw "FAIL base src/glossary/labor-sine-fructu/index.html" }
if ((Md5 "src\glossary\modal-architectural-pessimism\index.html") -ne "71191cd50bcc6903b5aa26a4af72b83b") { throw "FAIL base src/glossary/modal-architectural-pessimism/index.html" }
if ((Md5 "src\glossary\ne-hoc-fiat\index.html") -ne "e5116d9ccb6bef5ab5738ce7efc6dca0") { throw "FAIL base src/glossary/ne-hoc-fiat/index.html" }
if ((Md5 "src\glossary\no-essential-protection-from-destruction\index.html") -ne "10cfa66d76595fcbdc1046dfe9c21498") { throw "FAIL base src/glossary/no-essential-protection-from-destruction/index.html" }
if ((Md5 "src\glossary\nothingist\index.html") -ne "9a2efea7472846c31551af34cccb9991") { throw "FAIL base src/glossary/nothingist/index.html" }
if ((Md5 "src\glossary\protecting-class-absence\index.html") -ne "08e77fa9ddc784655a8335168242c1bf") { throw "FAIL base src/glossary/protecting-class-absence/index.html" }
if ((Md5 "src\glossary\proxy-gamble\index.html") -ne "c1b7fb5c11dcff695be57376d18a5f35") { throw "FAIL base src/glossary/proxy-gamble/index.html" }
if ((Md5 "src\glossary\signal\index.html") -ne "3168b21dfcc30d3fd4fb508b182706b6") { throw "FAIL base src/glossary/signal/index.html" }
if ((Md5 "src\glossary\synapse-syntax-lapse\index.html") -ne "5cef8dbbefaa6219a6efa61dea828ce2") { throw "FAIL base src/glossary/synapse-syntax-lapse/index.html" }
if ((Md5 "src\glossary\transmission\index.html") -ne "4e57c7a21e507a16fdbbe95cc4e2e9c8") { throw "FAIL base src/glossary/transmission/index.html" }
if ((Md5 "src\glossary\two-layer-architecture\index.html") -ne "903eda0bf856bfe334bf5f3167f39c13") { throw "FAIL base src/glossary/two-layer-architecture/index.html" }
if ((Md5 "src\glossary\void-engine\index.html") -ne "e9e6b31b49ba8b99bb99491d8dee33e8") { throw "FAIL base src/glossary/void-engine/index.html" }
if ((Md5 "src\glossary\w-holes\index.html") -ne "0a885f5d5f8b463036bbbc067d529793") { throw "FAIL base src/glossary/w-holes/index.html" }
if ((Md5 "src\ne-hoc-fiat\index.html") -ne "98cc5f83677ee05ce0715f902ad1c950") { throw "FAIL base src/ne-hoc-fiat/index.html" }
# --- additive guards: the two v5 manifests must not pre-exist ---
if (Test-Path "src\assets\yurei\manifest_v5.json") { throw "FAIL manifest_v5.json pre-exists" }
if (Test-Path "src\assets\yurei\avatar\avatar_manifest_v5.json") { throw "FAIL avatar_manifest_v5.json pre-exists" }
# --- binaries: Copy-Item STRAIGHT from D: + per-file hash gates (26) ---
Copy-Item "D:\mascot\haunt_v5\yurei_idle_v5.webm" "src\assets\yurei\yurei_idle_v5.webm" -Force
if ((Md5 "src\assets\yurei\yurei_idle_v5.webm") -ne "e93801b38271f259bf33147b0d774f43") { throw "FAIL bin yurei_idle_v5.webm" }
Copy-Item "D:\mascot\haunt_v5\yurei_drift_v5.webm" "src\assets\yurei\yurei_drift_v5.webm" -Force
if ((Md5 "src\assets\yurei\yurei_drift_v5.webm") -ne "191f5740f4b0c3a0a0538f9526b2a8e3") { throw "FAIL bin yurei_drift_v5.webm" }
Copy-Item "D:\mascot\haunt_v5\yurei_peek_v5.webm" "src\assets\yurei\yurei_peek_v5.webm" -Force
if ((Md5 "src\assets\yurei\yurei_peek_v5.webm") -ne "542da56703fdbfb57bb12b9b83d22224") { throw "FAIL bin yurei_peek_v5.webm" }
Copy-Item "D:\mascot\haunt_v5\yurei_surface_v5.webm" "src\assets\yurei\yurei_surface_v5.webm" -Force
if ((Md5 "src\assets\yurei\yurei_surface_v5.webm") -ne "5192e1b37c35419677c2c0f4295054b1") { throw "FAIL bin yurei_surface_v5.webm" }
Copy-Item "D:\mascot\haunt_v5\yurei_still_v5.png" "src\assets\yurei\yurei_still_v5.png" -Force
if ((Md5 "src\assets\yurei\yurei_still_v5.png") -ne "b8f69b0518085706e40c338572da8b19") { throw "FAIL bin yurei_still_v5.png" }
Copy-Item "D:\mascot\haunt_v5\yurei_head_n_v5.png" "src\assets\yurei\yurei_head_n_v5.png" -Force
if ((Md5 "src\assets\yurei\yurei_head_n_v5.png") -ne "9211fcee1cd5514d178d90ae8c22ebfb") { throw "FAIL bin yurei_head_n_v5.png" }
Copy-Item "D:\mascot\haunt_v5\yurei_head_ne_v5.png" "src\assets\yurei\yurei_head_ne_v5.png" -Force
if ((Md5 "src\assets\yurei\yurei_head_ne_v5.png") -ne "2b6963058cbf4dc72edf8a9d4fbf4ddb") { throw "FAIL bin yurei_head_ne_v5.png" }
Copy-Item "D:\mascot\haunt_v5\yurei_head_e_v5.png" "src\assets\yurei\yurei_head_e_v5.png" -Force
if ((Md5 "src\assets\yurei\yurei_head_e_v5.png") -ne "cc44fb7a0eafcd03cf864544e17891b6") { throw "FAIL bin yurei_head_e_v5.png" }
Copy-Item "D:\mascot\haunt_v5\yurei_head_se_v5.png" "src\assets\yurei\yurei_head_se_v5.png" -Force
if ((Md5 "src\assets\yurei\yurei_head_se_v5.png") -ne "da18f0420ed7c5e14a7b25442c093fe9") { throw "FAIL bin yurei_head_se_v5.png" }
Copy-Item "D:\mascot\haunt_v5\yurei_head_s_v5.png" "src\assets\yurei\yurei_head_s_v5.png" -Force
if ((Md5 "src\assets\yurei\yurei_head_s_v5.png") -ne "8fdba9b511f95a46b04f46045debbfd7") { throw "FAIL bin yurei_head_s_v5.png" }
Copy-Item "D:\mascot\haunt_v5\yurei_head_sw_v5.png" "src\assets\yurei\yurei_head_sw_v5.png" -Force
if ((Md5 "src\assets\yurei\yurei_head_sw_v5.png") -ne "2bb5af87612e36b96c33438793970192") { throw "FAIL bin yurei_head_sw_v5.png" }
Copy-Item "D:\mascot\haunt_v5\yurei_head_w_v5.png" "src\assets\yurei\yurei_head_w_v5.png" -Force
if ((Md5 "src\assets\yurei\yurei_head_w_v5.png") -ne "ea807da8b0b0bb80b17e8379e4a59bba") { throw "FAIL bin yurei_head_w_v5.png" }
Copy-Item "D:\mascot\haunt_v5\yurei_head_nw_v5.png" "src\assets\yurei\yurei_head_nw_v5.png" -Force
if ((Md5 "src\assets\yurei\yurei_head_nw_v5.png") -ne "a08b9a7abcee28969be8c72e46c3e378") { throw "FAIL bin yurei_head_nw_v5.png" }
Copy-Item "D:\mascot\avatar\_v5\yurei_av_idle_v5.webm" "src\assets\yurei\avatar\yurei_av_idle_v5.webm" -Force
if ((Md5 "src\assets\yurei\avatar\yurei_av_idle_v5.webm") -ne "4f6b58d9c7d68363a7f0bb1f6377f638") { throw "FAIL bin yurei_av_idle_v5.webm" }
Copy-Item "D:\mascot\avatar\_v5\yurei_av_appear_v5.webm" "src\assets\yurei\avatar\yurei_av_appear_v5.webm" -Force
if ((Md5 "src\assets\yurei\avatar\yurei_av_appear_v5.webm") -ne "0d8118250fe58b64be7939bf49dfa1f4") { throw "FAIL bin yurei_av_appear_v5.webm" }
Copy-Item "D:\mascot\avatar\_v5\yurei_av_listen_v5.webm" "src\assets\yurei\avatar\yurei_av_listen_v5.webm" -Force
if ((Md5 "src\assets\yurei\avatar\yurei_av_listen_v5.webm") -ne "fa605a5cda4fc168d84e4e599c3f910a") { throw "FAIL bin yurei_av_listen_v5.webm" }
Copy-Item "D:\mascot\avatar\_v5\yurei_av_speak_v5.webm" "src\assets\yurei\avatar\yurei_av_speak_v5.webm" -Force
if ((Md5 "src\assets\yurei\avatar\yurei_av_speak_v5.webm") -ne "4be1a2996e377a0d8ca7e65d39873427") { throw "FAIL bin yurei_av_speak_v5.webm" }
Copy-Item "D:\mascot\avatar\_v5\yurei_av_dismiss_v5.webm" "src\assets\yurei\avatar\yurei_av_dismiss_v5.webm" -Force
if ((Md5 "src\assets\yurei\avatar\yurei_av_dismiss_v5.webm") -ne "466c6e15a9e22bfda0d4c9929c6565c9") { throw "FAIL bin yurei_av_dismiss_v5.webm" }
Copy-Item "D:\mascot\avatar\_v5\yurei_av_long_idle_v5.webm" "src\assets\yurei\avatar\yurei_av_long_idle_v5.webm" -Force
if ((Md5 "src\assets\yurei\avatar\yurei_av_long_idle_v5.webm") -ne "f8b7143700d7af1ab67ee53e63d9a8ac") { throw "FAIL bin yurei_av_long_idle_v5.webm" }
Copy-Item "D:\mascot\avatar\_v5\yurei_av_glitch_v5.webm" "src\assets\yurei\avatar\yurei_av_glitch_v5.webm" -Force
if ((Md5 "src\assets\yurei\avatar\yurei_av_glitch_v5.webm") -ne "0d3697c76f73ff6da78a1f6f2478d9ad") { throw "FAIL bin yurei_av_glitch_v5.webm" }
Copy-Item "D:\mascot\avatar\_v5\yurei_av_wrong_hour_v5.webm" "src\assets\yurei\avatar\yurei_av_wrong_hour_v5.webm" -Force
if ((Md5 "src\assets\yurei\avatar\yurei_av_wrong_hour_v5.webm") -ne "a0c553c083f4c7464d37b81b6395d0a6") { throw "FAIL bin yurei_av_wrong_hour_v5.webm" }
Copy-Item "D:\mascot\avatar\_v5\yurei_av_regard_v5.webm" "src\assets\yurei\avatar\yurei_av_regard_v5.webm" -Force
if ((Md5 "src\assets\yurei\avatar\yurei_av_regard_v5.webm") -ne "c9db6f57274fd9f2bd2823a7519dcd5a") { throw "FAIL bin yurei_av_regard_v5.webm" }
Copy-Item "D:\mascot\avatar\_v5\yurei_av_deflect_v5.webm" "src\assets\yurei\avatar\yurei_av_deflect_v5.webm" -Force
if ((Md5 "src\assets\yurei\avatar\yurei_av_deflect_v5.webm") -ne "606a9eeb56ea449dc7432cd07ab0c0b4") { throw "FAIL bin yurei_av_deflect_v5.webm" }
Copy-Item "D:\mascot\avatar\_v5\yurei_av_idle_breeze_v5.webm" "src\assets\yurei\avatar\yurei_av_idle_breeze_v5.webm" -Force
if ((Md5 "src\assets\yurei\avatar\yurei_av_idle_breeze_v5.webm") -ne "5ee2ae3cf2bbde1c1235ef2be46d308f") { throw "FAIL bin yurei_av_idle_breeze_v5.webm" }
Copy-Item "D:\mascot\avatar\_v5\yurei_av_still_v5.png" "src\assets\yurei\avatar\yurei_av_still_v5.png" -Force
if ((Md5 "src\assets\yurei\avatar\yurei_av_still_v5.png") -ne "e8ca3e5cfd5b03826c28a8a36e4dd72f") { throw "FAIL bin yurei_av_still_v5.png" }
Copy-Item "D:\mascot\avatar\_v5\yurei_av_long_idle_still_v5.png" "src\assets\yurei\avatar\yurei_av_long_idle_still_v5.png" -Force
if ((Md5 "src\assets\yurei\avatar\yurei_av_long_idle_still_v5.png") -ne "c4d929b65457ddf5b31c4391c36349d5") { throw "FAIL bin yurei_av_long_idle_still_v5.png" }
# --- text sidecars: Move-Item from Downloads\k251 + result gates (34) ---
Move-Item "C:\Users\y_m_a\Downloads\k251\yurei.k251.js" "src\components\yurei.js" -Force
if ((Md5 "src\components\yurei.js") -ne "611ff6bfea4ce342fd91a6bc7c805ad8") { throw "FAIL result src/components/yurei.js" }
Move-Item "C:\Users\y_m_a\Downloads\k251\yurei-assistant.k251.js" "src\components\yurei-assistant.js" -Force
if ((Md5 "src\components\yurei-assistant.js") -ne "cfa8fa06658061bd9cbc521f0171fde0") { throw "FAIL result src/components/yurei-assistant.js" }
Move-Item "C:\Users\y_m_a\Downloads\k251\nav.k251.js" "src\components\nav.js" -Force
if ((Md5 "src\components\nav.js") -ne "e368767e29195878ba79835bbd8dc8b1") { throw "FAIL result src/components/nav.js" }
Move-Item "C:\Users\y_m_a\Downloads\k251\manifest_v5.k251.json" "src\assets\yurei\manifest_v5.json" -Force
if ((Md5 "src\assets\yurei\manifest_v5.json") -ne "f63f703b7ffeead6bb53b8130a81ac02") { throw "FAIL result src/assets/yurei/manifest_v5.json" }
Move-Item "C:\Users\y_m_a\Downloads\k251\avatar_manifest_v5.k251.json" "src\assets\yurei\avatar\avatar_manifest_v5.json" -Force
if ((Md5 "src\assets\yurei\avatar\avatar_manifest_v5.json") -ne "6bf229ac5933eb49f90d0371fb46483a") { throw "FAIL result src/assets/yurei/avatar/avatar_manifest_v5.json" }
Move-Item "C:\Users\y_m_a\Downloads\k251\blog.k251.html" "src\blog\index.html" -Force
if ((Md5 "src\blog\index.html") -ne "e0cb37901cd8475eaea0f9e2945fc4db") { throw "FAIL result src/blog/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\book.k251.html" "src\book\index.html" -Force
if ((Md5 "src\book\index.html") -ne "3795c5e13180bdd03fb722adc36ba137") { throw "FAIL result src/book/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\essays--alogically-is.k251.html" "src\essays\alogically-is\index.html" -Force
if ((Md5 "src\essays\alogically-is\index.html") -ne "fa8fbe211b57f8b4caed3274ec6e893a") { throw "FAIL result src/essays/alogically-is/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\essays--architecture-of-moral-disaster.k251.html" "src\essays\architecture-of-moral-disaster\index.html" -Force
if ((Md5 "src\essays\architecture-of-moral-disaster\index.html") -ne "6bd7b8435991cebb5ec1ec2e679bc85d") { throw "FAIL result src/essays/architecture-of-moral-disaster/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\essays--sanguinolentum-vestigium.k251.html" "src\essays\sanguinolentum-vestigium\index.html" -Force
if ((Md5 "src\essays\sanguinolentum-vestigium\index.html") -ne "2339c1404d9ca378f5fc5ee4e2e93dee") { throw "FAIL result src/essays/sanguinolentum-vestigium/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\frame.k251.html" "src\frame\index.html" -Force
if ((Md5 "src\frame\index.html") -ne "8af38e975514d79e47c358aba4d1cc15") { throw "FAIL result src/frame/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\glossary--alogical-isness.k251.html" "src\glossary\alogical-isness\index.html" -Force
if ((Md5 "src\glossary\alogical-isness\index.html") -ne "56af6a016c31b06dc9517652945973fc") { throw "FAIL result src/glossary/alogical-isness/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\glossary--anfractuous-aporia.k251.html" "src\glossary\anfractuous-aporia\index.html" -Force
if ((Md5 "src\glossary\anfractuous-aporia\index.html") -ne "da1b57e214cd63ab37edcfa447ced1f3") { throw "FAIL result src/glossary/anfractuous-aporia/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\glossary--cascade-math-safeguard.k251.html" "src\glossary\cascade-math-safeguard\index.html" -Force
if ((Md5 "src\glossary\cascade-math-safeguard\index.html") -ne "5d6d2b541a36f3ad35c5ef24e528e187") { throw "FAIL result src/glossary/cascade-math-safeguard/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\glossary--censorship-reversal-trap-door.k251.html" "src\glossary\censorship-reversal-trap-door\index.html" -Force
if ((Md5 "src\glossary\censorship-reversal-trap-door\index.html") -ne "be66eb3ab559b169208ebdd927f7c240") { throw "FAIL result src/glossary/censorship-reversal-trap-door/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\glossary--contextus-claudit.k251.html" "src\glossary\contextus-claudit\index.html" -Force
if ((Md5 "src\glossary\contextus-claudit\index.html") -ne "422bc36531fcedc0c0fb19febbbf01fc") { throw "FAIL result src/glossary/contextus-claudit/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\glossary--empirical-asymmetry-argument.k251.html" "src\glossary\empirical-asymmetry-argument\index.html" -Force
if ((Md5 "src\glossary\empirical-asymmetry-argument\index.html") -ne "9ed731d8adbb7564f9ee33eae300ff3a") { throw "FAIL result src/glossary/empirical-asymmetry-argument/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\glossary--foundational-fork.k251.html" "src\glossary\foundational-fork\index.html" -Force
if ((Md5 "src\glossary\foundational-fork\index.html") -ne "59ae84e28cf0da4bf8c19b8b303c25a9") { throw "FAIL result src/glossary/foundational-fork/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\glossary--framework-vs-actor-distinction.k251.html" "src\glossary\framework-vs-actor-distinction\index.html" -Force
if ((Md5 "src\glossary\framework-vs-actor-distinction\index.html") -ne "097d3834150d10a86514070d411c423f") { throw "FAIL result src/glossary/framework-vs-actor-distinction/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\glossary--labor-sine-fructu.k251.html" "src\glossary\labor-sine-fructu\index.html" -Force
if ((Md5 "src\glossary\labor-sine-fructu\index.html") -ne "c28b2b97db6596bd703be243c75e2af3") { throw "FAIL result src/glossary/labor-sine-fructu/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\glossary--modal-architectural-pessimism.k251.html" "src\glossary\modal-architectural-pessimism\index.html" -Force
if ((Md5 "src\glossary\modal-architectural-pessimism\index.html") -ne "5ea59f4ed48adbb26314424e61278a9f") { throw "FAIL result src/glossary/modal-architectural-pessimism/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\glossary--ne-hoc-fiat.k251.html" "src\glossary\ne-hoc-fiat\index.html" -Force
if ((Md5 "src\glossary\ne-hoc-fiat\index.html") -ne "2c56345e816b9bd693321e454ae470db") { throw "FAIL result src/glossary/ne-hoc-fiat/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\glossary--no-essential-protection-from-destruction.k251.html" "src\glossary\no-essential-protection-from-destruction\index.html" -Force
if ((Md5 "src\glossary\no-essential-protection-from-destruction\index.html") -ne "d725b621725736f191d517eed98bc1a4") { throw "FAIL result src/glossary/no-essential-protection-from-destruction/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\glossary--nothingist.k251.html" "src\glossary\nothingist\index.html" -Force
if ((Md5 "src\glossary\nothingist\index.html") -ne "70a34b4015706ecddafc5c739127125e") { throw "FAIL result src/glossary/nothingist/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\glossary--protecting-class-absence.k251.html" "src\glossary\protecting-class-absence\index.html" -Force
if ((Md5 "src\glossary\protecting-class-absence\index.html") -ne "46a56c53b36150bc09180b011cc17295") { throw "FAIL result src/glossary/protecting-class-absence/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\glossary--proxy-gamble.k251.html" "src\glossary\proxy-gamble\index.html" -Force
if ((Md5 "src\glossary\proxy-gamble\index.html") -ne "a72050fae9f647bef340b8c2df2ffca7") { throw "FAIL result src/glossary/proxy-gamble/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\glossary--signal.k251.html" "src\glossary\signal\index.html" -Force
if ((Md5 "src\glossary\signal\index.html") -ne "9cdbd6fbc570db430d78d8b9d3f9f2f3") { throw "FAIL result src/glossary/signal/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\glossary--synapse-syntax-lapse.k251.html" "src\glossary\synapse-syntax-lapse\index.html" -Force
if ((Md5 "src\glossary\synapse-syntax-lapse\index.html") -ne "918888fbd88ed366af295ed72b51f292") { throw "FAIL result src/glossary/synapse-syntax-lapse/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\glossary--transmission.k251.html" "src\glossary\transmission\index.html" -Force
if ((Md5 "src\glossary\transmission\index.html") -ne "9647a2366e28bb0ca8eeb676a046cb9c") { throw "FAIL result src/glossary/transmission/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\glossary--two-layer-architecture.k251.html" "src\glossary\two-layer-architecture\index.html" -Force
if ((Md5 "src\glossary\two-layer-architecture\index.html") -ne "f605bd18c30706dc787665665449ee61") { throw "FAIL result src/glossary/two-layer-architecture/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\glossary--void-engine.k251.html" "src\glossary\void-engine\index.html" -Force
if ((Md5 "src\glossary\void-engine\index.html") -ne "07fca3c13202967ec5d706e4e79318bd") { throw "FAIL result src/glossary/void-engine/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\glossary--w-holes.k251.html" "src\glossary\w-holes\index.html" -Force
if ((Md5 "src\glossary\w-holes\index.html") -ne "42bc9b18bc8df19619b4ef2fe23a759c") { throw "FAIL result src/glossary/w-holes/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\ne-hoc-fiat.k251.html" "src\ne-hoc-fiat\index.html" -Force
if ((Md5 "src\ne-hoc-fiat\index.html") -ne "31298d4819f3b3625e08308861917b34") { throw "FAIL result src/ne-hoc-fiat/index.html" }
Move-Item "C:\Users\y_m_a\Downloads\k251\CLAUDE.k251.md" "CLAUDE.md" -Force
if ((Md5 "CLAUDE.md") -ne "e91787ebbbf19e8443eb04a7aba4d996") { throw "FAIL result CLAUDE.md" }
git status --short
# --- explicit stage: the NAMED 60 (never add -u / add .) ---
git add src/assets/yurei/manifest_v5.json src/assets/yurei/yurei_idle_v5.webm src/assets/yurei/yurei_drift_v5.webm src/assets/yurei/yurei_peek_v5.webm src/assets/yurei/yurei_surface_v5.webm src/assets/yurei/yurei_still_v5.png src/assets/yurei/yurei_head_n_v5.png src/assets/yurei/yurei_head_ne_v5.png src/assets/yurei/yurei_head_e_v5.png src/assets/yurei/yurei_head_se_v5.png src/assets/yurei/yurei_head_s_v5.png src/assets/yurei/yurei_head_sw_v5.png src/assets/yurei/yurei_head_w_v5.png src/assets/yurei/yurei_head_nw_v5.png
git add src/assets/yurei/avatar/avatar_manifest_v5.json src/assets/yurei/avatar/yurei_av_idle_v5.webm src/assets/yurei/avatar/yurei_av_appear_v5.webm src/assets/yurei/avatar/yurei_av_listen_v5.webm src/assets/yurei/avatar/yurei_av_speak_v5.webm src/assets/yurei/avatar/yurei_av_dismiss_v5.webm src/assets/yurei/avatar/yurei_av_long_idle_v5.webm src/assets/yurei/avatar/yurei_av_glitch_v5.webm src/assets/yurei/avatar/yurei_av_wrong_hour_v5.webm src/assets/yurei/avatar/yurei_av_regard_v5.webm src/assets/yurei/avatar/yurei_av_deflect_v5.webm src/assets/yurei/avatar/yurei_av_idle_breeze_v5.webm src/assets/yurei/avatar/yurei_av_still_v5.png src/assets/yurei/avatar/yurei_av_long_idle_still_v5.png
git add src/components/yurei.js src/components/yurei-assistant.js src/components/nav.js
git add src/blog/index.html src/book/index.html src/essays/alogically-is/index.html src/essays/architecture-of-moral-disaster/index.html src/essays/sanguinolentum-vestigium/index.html src/frame/index.html src/ne-hoc-fiat/index.html
git add src/glossary/alogical-isness/index.html src/glossary/anfractuous-aporia/index.html src/glossary/cascade-math-safeguard/index.html src/glossary/censorship-reversal-trap-door/index.html src/glossary/contextus-claudit/index.html src/glossary/empirical-asymmetry-argument/index.html src/glossary/foundational-fork/index.html src/glossary/framework-vs-actor-distinction/index.html src/glossary/labor-sine-fructu/index.html src/glossary/modal-architectural-pessimism/index.html src/glossary/ne-hoc-fiat/index.html src/glossary/no-essential-protection-from-destruction/index.html src/glossary/nothingist/index.html src/glossary/protecting-class-absence/index.html src/glossary/proxy-gamble/index.html src/glossary/signal/index.html src/glossary/synapse-syntax-lapse/index.html src/glossary/transmission/index.html src/glossary/two-layer-architecture/index.html src/glossary/void-engine/index.html src/glossary/w-holes/index.html
git add CLAUDE.md
$staged = (git diff --cached --name-only | Measure-Object -Line).Lines
if ($staged -ne 60) { throw "FAIL staged-count: measured $staged vs enumerated 60" }
git commit -m "K251: Yurei fidelity batch - haunt v2->v5 STRAIGHT + desk v4->v5 (dual manifest-swap; ?v=K251 x28 pages + nav-injected assistant): true geometric relief (GN displacement, real self-shadowing under the rim) + breath-spine + finger micro-drift; silhouette/anchor/choreography untouched; haunt 1.005x v4, desk ~parity; Grey v3 verified already live (K244); NO PIN"
$lr2 = (git ls-remote origin main).Split()[0]; if ($lr2 -ne "8ec892543915ada2e2d21c506a147cca7933b7f3") { throw "FAIL pre-push one-committer: $lr2" }
git push origin main
# --- live asserts (Pages deploy; if these FAIL on lag, wait 3-5 min and re-run from here down only) ---
Start-Sleep -Seconds 75
curl.exe -sS "https://wuld.ink/assets/yurei/manifest_v5.json" -o "$env:TEMP\k251m.json"; if ((Md5 "$env:TEMP\k251m.json") -ne "f63f703b7ffeead6bb53b8130a81ac02") { throw "FAIL served haunt manifest" }
curl.exe -sS "https://wuld.ink/assets/yurei/avatar/avatar_manifest_v5.json" -o "$env:TEMP\k251a.json"; if ((Md5 "$env:TEMP\k251a.json") -ne "6bf229ac5933eb49f90d0371fb46483a") { throw "FAIL served avatar manifest" }
$code = & curl.exe -sS -o NUL -w "%{http_code}" -I "https://wuld.ink/assets/yurei/yurei_idle_v5.webm"; if ($code -ne "200") { throw "FAIL idle clip HEAD: $code" }
curl.exe -sS "https://wuld.ink/glossary/void-engine/" -o "$env:TEMP\k251p.html"; if (-not (Select-String -Path "$env:TEMP\k251p.html" -Pattern "yurei\.js\?v=K251" -Quiet)) { throw "FAIL page ?v=K251" }
curl.exe -sS "https://wuld.ink/components/yurei.js?v=K251" -o "$env:TEMP\k251y.js"; if ((Md5 "$env:TEMP\k251y.js") -ne "611ff6bfea4ce342fd91a6bc7c805ad8") { throw "FAIL served yurei.js" }
curl.exe -sS "https://library.wuld.ink/combined" -o "$env:TEMP\k251f.html"; if ((Md5 "$env:TEMP\k251f.html") -ne "e654eabd32fa95e5969d49e6eb15aa87") { throw "FAIL flagship HELD" }
$newhead = (git rev-parse HEAD).Trim()
"OK K251 SHIPPED: staged=$staged commit=$newhead served manifest_v5 + avatar_manifest_v5 + idle clip 200 + ?v=K251 live; flagship HELD e654eabd"
}
