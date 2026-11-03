# Topohelden – groepen en vrije leerstofkeuze

Deze iteratie herstelt de basis van masterplan v0.2: eerst groep 4–8 kiezen, daarbinnen Topografie en Aardrijkskunde, met vrije bibliotheek en aanpasbare selectie. De styling is afgeleid van de geïnspecteerde Taalhelden-code; de groepskeuze is ook vergeleken met Rekenhelden.

## Wat werkt
- Groepsknoppen, periodekeuze, vaktegels en voortgang naast de vakken.
- West-Nederland aan elke groep/periode koppelen, met een eigen opgeslagen selectie per combinatie.
- Dezelfde 36 geografische records worden hergebruikt; geen duplicatie.
- Bestaande kaarttraining en foutenherhaling. 20 plaatsen en de drie West-Nederlandse provincies zijn oefenbaar.
- Aardrijkskunde toont per groep een voorgesteld thema; de lessen zijn nog niet gebouwd.

## Openen
Pak alle bestanden samen uit. Open index.html of publiceer de bestanden in de hoofdmap van de statische website. Houd topo.css naast index.html. Leaflet en kaarttegels vereisen internet. Browseropslag geldt per apparaat en weborigin; een lokale download deelt geen opslag met de live website.

## Testen en status
`node check-training.cjs` controleert score, herhaling, opslag, groep/periode, hergebruik en selecties met gesimuleerde DOM/kaart. Dit is geen echte browser- of iPhone-test. Zie BESLUITEN_EN_STATUS.md voor het voortgangsregister. De eerdere F1–F4-downloadlabels waren prototypeversies, geen afgeronde masterplanfasen.

## Kaartbasis uitgebreid
Provincies zijn nu vlakken, vijf wateren tonen NWB-vaarweglijnen en Vleuten heeft een BAG-woonplaatsmiddelpunt. De overige plaatsingspunten blijven indicatief. Wateren worden nog niet geoefend. Kies bij Oefenen voor Plaatsen of Provincies; de groeps- en periodekeuze blijft vrij.

Geodata wordt lokaal uit geodata.js geladen. Houd dit bestand naast index.html. Lees BRONNEN_EN_GEOMETRIE.md voor bronnen, licenties, dekking en controles. De bijgeleverde bronresponsen en het bouwscript maken de geometriebundel reproduceerbaar.

Controle: `node check-geodata.cjs` en `node check-training.cjs`. Er is nog geen echte browser-/iPhone-test uitgevoerd.
