# Fonts

All fonts are used unmodified. Fraunces, Archivo Black, Courier Prime, DM Sans, Bebas Neue,
Dancing Script, Playfair Display and Nunito Sans are licensed under the SIL Open Font License 1.1
(https://openfontlicense.org). Permanent Marker is licensed under the Apache License 2.0.
Print fonts live in `assets/fonts` (print-file rendering) and `public/fonts` (website + live preview).
Each `.ttf` in `public/fonts` has a `.woff2` copy next to it: the same font, only compressed for browsers
(made with fontTools, `font.flavor = 'woff2'`). If a `.ttf` is replaced, remake its `.woff2`.

| File | Family | Copyright |
|---|---|---|
| Fraunces_900Black.ttf, Fraunces_900Black_Italic.ttf | Fraunces | Copyright 2020 The Fraunces Project Authors (github.com/undercasetype/Fraunces) |
| ArchivoBlack_400Regular.ttf | Archivo Black | Copyright 2017 The Archivo Black Project Authors (github.com/Omnibus-Type/ArchivoBlack) |
| PermanentMarker_400Regular.ttf | Permanent Marker | Copyright (c) 2010 by Font Diner, Inc. (Apache License 2.0) |
| CourierPrime_700Bold.ttf | Courier Prime | Copyright 2015 The Courier Prime Project Authors (github.com/quoteunquoteapps/CourierPrime) |
| DMSans_*.ttf (website only) | DM Sans | Copyright 2014 The DM Sans Project Authors (github.com/googlefonts/dm-fonts) |
| BebasNeue_400Regular.ttf | Bebas Neue | Copyright 2019 The Bebas Neue Project Authors (github.com/dharmatype/Bebas-Neue) |
| DancingScript_700Bold.ttf | Dancing Script | Copyright 2016 The Dancing Script Project Authors (github.com/googlefonts/DancingScript) |
| PlayfairDisplay_700Bold.ttf | Playfair Display | Copyright 2017 The Playfair Display Project Authors (github.com/clauseggers/Playfair-Display) |
| NunitoSans_700Bold.ttf | Nunito Sans | Copyright 2016 The Nunito Sans Project Authors (github.com/Fonthausen/NunitoSans) |

Source: Google Fonts, via the @expo-google-fonts npm packages.
