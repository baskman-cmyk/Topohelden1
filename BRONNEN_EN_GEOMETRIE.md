# Kaartbasis – punt, lijn en vlak

Opgehaald op 3 november 2026. Dit is de eerste geometrie-iteratie van het
masterplan, geen volledige WNL-01-acceptatie.

## In de app

| Objecten | Weergave | Oefenen | Controle |
|---|---|---|---|
| Zuid-Holland, Noord-Holland, Utrecht (provincie) | Vlakken met provinciegrens | Aanwijzen en herkennen | Bronkoppeling, geldigheid, hoofdsteden en coördinaten gecontroleerd |
| Lek, Nieuwe Maas, Nieuwe Waterweg, Noordzeekanaal, Amsterdam-Rijnkanaal | Lijnen uit NWB Vaarwegen | Nee | Exacte naamkoppeling en volledige API-respons gecontroleerd; inhoudelijke dekking nog open |
| Vleuten | BAG-woonplaatsmiddelpunt | Ja, als representatief plaatsingspunt | Valt binnen Utrecht; geen bebouwde-komgrens |
| Overige 19 plaatsen | Bestaande indicatieve punten | Ja, prototype zoals eerder | Definitieve onderwijsinhoudelijke puntcontrole nog open |
| Overige 8 namen | Voorlopige representatieve punten | Nee | Correcte geometrie ontbreekt nog |

De provincie Utrecht en de plaats Utrecht hebben aparte ID's. Vraagvormen houden
plaats en provincie uit elkaar. Afleiders in een provincie-opdracht zijn andere
provincies; plaatsvragen gebruiken plaatsen. De categorie kan vooraf worden gekozen.

## Bronnen en licenties

- Provincies: Kadaster, Bestuurlijke Gebieden via PDOK, CC BY 4.0.
  https://api.pdok.nl/kadaster/brk-bestuurlijke-gebieden/ogc/v1/collections/provinciegebied/items?f=json&limit=20
  https://creativecommons.org/licenses/by/4.0/
- Waterlijnen: Rijkswaterstaat, Nationaal Wegenbestand Vaarwegen via PDOK, CC0 1.0.
  https://api.pdok.nl/rws/nationaal-wegenbestand-vaarwegen/ogc/v1/api?f=html&lang=nl
  Per object staat de exacte query, bron-ID's en ophaaldatum in geodata.json.
- Vleuten: BAG via PDOK Locatieserver, onderliggende BAG-data CC0 1.0.
  https://www.pdok.nl/introductie/-/article/pdok-locatieserver-1
  https://data.overheid.nl/dataset/basisregistratie-adressen-en-gebouwen--bag-

De provinciegrenzen zijn voor de schoolkaart topologiebehoudend vereenvoudigd
in RD-coördinaten met een tolerantie van 25 meter en teruggerekend naar WGS84.
De relatieve oppervlakteverandering is per provincie kleiner dan 0,01%.
Dit is geen kaart voor kadastrale grensbepaling. Waterlijnen zijn vereenvoudigd
met een tolerantie van 10 meter. De aanpassingen zijn in de bronmetadata vermeld.

## Waarom wateren nog niet worden getoetst

NWB beschrijft vaarwegvakken, geen oevers. De lijn kan niet zonder extra inhoudelijke
controle gelijk worden gesteld aan de volledige rivier, het hele kanaal of een meer.
Bijvoorbeeld: de op naam opgehaalde Lek-vakken hebben samen circa 58,70 km lijn,
terwijl Rijkswaterstaat 62 km rivierlengte vermeldt. Voor Nieuwe Waterweg bevat
de naamquery circa 6,65 km lijn. Deze verschillen moeten worden uitgezocht voordat
een toets de dekking als correct kan beschouwen.

Referentie: https://www.rijkswaterstaat.nl/water/vaarwegenoverzicht/lek

Hetzelfde geldt voor woonplaatsmiddelpunten: zij hoeven niet op het centrum van
de bebouwing te liggen. De overige plaatsingspunten zijn daarom niet blind door
geocoderesultaten vervangen.

## Bestanden en controle

- geodata.js: lokale bundel die ook bij openen van index.html zonder webserver laadt.
- geodata.json: dezelfde inhoud als leesbare, verwerkbare bronregistratie.
- data/sources/: ongewijzigde opgehaalde bronresponsen voor deze negen objecten
  (de provincierespons bevat alle twaalf provincies).
- geometry-checks.json: technische geldigheid en afwijkingsmaten van vereenvoudiging.
- scripts/build-geodata.py: reproduceert de bundel met Python, Shapely en pyproj.
- `node check-geodata.cjs`: bronvermelding, gesloten ringen, puntvolgorde,
  hoofdsteden, negatieve provinciegevallen en water-uitsluiting.
- `node check-training.cjs`: selectie, scoring, herhaling, opslag en geometrie-dispatch
  met gesimuleerde DOM/kaart. Dit is geen echte browsertest.

Kaarttegels en Leaflet vereisen nog internet. De brongeometrieën zijn meegeleverd,
maar dat maakt de gehele kaart niet offline beschikbaar.
