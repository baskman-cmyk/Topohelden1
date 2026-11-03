# Topohelden – mobiele leerroute en kaarttraining

- Leerroute voor groep 4–8; alleen West-Nederland (groep 6, periode 1) bevat leerstof.
- Vrije selectie van de 36 namen blijft beschikbaar en lokaal bewaard.
- Kaarttraining met maximaal tien geselecteerde steden: naam herkennen of kaartpunt aanwijzen.
- Score, punten en feedback; de voortgang blijft op dit apparaat bewaard.
- Geen accounts of synchronisatie. Bij geblokkeerde opslag werkt oefenen voor deze sessie.

## Beperkingen
Coördinaten zijn indicatieve, niet onafhankelijk geverifieerde punten. Alleen steden worden geoefend; wateren en gebieden vereisen gecontroleerde lijnen/polygonen. De leerroute is een voorstel, geen officieel SLO-programma. Kaarttegels en Leaflet vereisen internet. Testen op echte iPhone/iPad blijft nodig.

## Publiceren
Statische app: bestanden in de hoofdmap, Vercel Framework Preset Other.

## Nieuw: foutgerichte herhaling
- Na elke reeks opnieuw oefenen met alleen de verkeerd beantwoorde steden.
- Extra herhalen gebruikt geselecteerde steden die al geoefend zijn en nog geen twee goede antwoorden achter elkaar hebben.
- Gemengde reeksen bevatten maximaal zes steden die extra herhaling nodig hebben, aangevuld tot maximaal tien met andere geselecteerde steden.
- Per stad: aantal pogingen, aantal goed en reeks goede antwoorden; lokaal opgeslagen naast de bestaande totaalscore.
- De genummerde kaartpunten zijn ook via knoppen te kiezen.
- Bij geblokkeerde opslag verschijnt een melding; de sessie blijft werken.

Dit is eenvoudige foutgerichte herhaling, geen planning met tijdsintervallen. De voortgang geldt voor de gezamenlijke gebruiker van deze browser en wordt nog niet per kind gescheiden.

## Controle
`node check-training.cjs` controleert score, dubbele antwoorden, foutenherhaling, de herhaalregel, opslag/migratie en foutafhandeling met een gesimuleerde kaart en pagina. De tests vervangen geen echte Safari-/kaarttest.
