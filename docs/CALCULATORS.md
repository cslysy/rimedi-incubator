# CALCULATORS.md

## Zasada bezpieczeństwa
Kalkulatory nie sugerują dawkowania. Liczą tylko wartości wpisane przez użytkownika albo techniczne parametry wynikające z wybranego preparatu.

Nie używać nazw:
- zalecana dawka,
- rekomendowana dawka.

Używać:
- dawka zlecona,
- wartość wpisana,
- obliczenie pomocnicze.

## Typy kalkulatorów MVP

### DOSE_TO_ML
Dawka → ml.

Przykład formuły:

```text
objętość = dawkaZlecona / stężenieNaMl
```

### MG_PER_KG_TO_MG
mg/kg → mg.

```text
dawkaCałkowita = dawkaNaKg * masaKg
```

### MG_PER_KG_TO_ML
mg/kg → ml.

```text
dawkaCałkowita = dawkaNaKg * masaKg
objętość = dawkaCałkowita / stężenieNaMl
```

### UNITS_TO_ML
j.m. → ml.

```text
objętość = liczbaJednostek / jednostkiNaMl
```

### ML_PER_HOUR
ml/h.

```text
mlNaGodzinę = objętośćMl / czasH
```

### DROPS_PER_MIN
krople/min.

```text
kropleNaMin = (objętośćMl * kropleNaMl) / czasMin
```

### AMPULE_COUNT
Ile ampułek.

```text
liczbaAmpułek = ceil(objętośćDoPodania / objętośćAmpułki)
```

## Wynik
Każdy wynik powinien zawierać:
- wynik główny,
- jednostkę,
- dane wejściowe,
- wzór lub opis obliczenia,
- ostrzeżenie, jeśli highRisk.

## Testy jednostkowe
Dodaj testy dla funkcji z `src/utils/calculations.ts`.

Przykłady:
- 500 mg przy stężeniu 250 mg / 2 ml daje 4 ml;
- 5 mg/kg przy masie 72 kg daje 360 mg;
- 100 ml przez 30 minut daje 200 ml/h;
- 500 ml przez 240 minut przy 20 kroplach/ml daje około 41.67 kropli/min.
