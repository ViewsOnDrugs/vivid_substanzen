## update the json file from the Google sheets file

import json

import pandas as pd

substance_sheet = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQM9INa12gkmzYivUzD4AqBpsYllL7Skehz6DdlqKWqVu3rPbYOA4IyFBo3q8IdswJNoUW7CmNLdZHs/pub?gid=1734089&single=true&output=csv"
substances_db = pd.read_csv(
    substance_sheet,
    engine="python",
    dtype=str,
    keep_default_na=False,
)
# Normalize column names (strip whitespace/BOM) and set index robustly.
substances_db.columns = [str(col).strip().lstrip("\ufeff") for col in substances_db.columns]
index_col = "Substanz"
if index_col not in substances_db.columns:
    # Fall back to first column if the expected header is missing or malformed.
    index_col = substances_db.columns[0]
substances_db = substances_db.set_index(index_col)
substances_db.index = substances_db.index.astype(str).str.strip()
substances_db = substances_db[substances_db.index != ""]

# Keep JSON standards-compliant by converting missing values to None.
substances_db = substances_db.where(pd.notnull(substances_db), None)

substance_dic = substances_db.to_dict("index")

## set columns to be joined in a dataframe
dose_oral = ['Dosierung Oral Leichte Dosis', 'Dosierung Oral Mittlere Dosis', 'Dosierung Oral Hohe Dosis']
wirkdauer_oral = ['Wirkdauer Oral Wirkungseintritt', 'Wirkdauer Oral Peak', 'Wirkdauer Oral Wirkdauer']
dose_nasal = ['Dosierung Nasal Leichte Dosis', 'Dosierung Nasal Mittlere Dosis', 'Dosierung Nasal Hohe Dosis']
wirkdauer_nasal = ['Wirkdauer Nasal Wirkungseintritt', 'Wirkdauer Nasal Peak', 'Wirkdauer Nasal Wirkdauer']
dose_inhaliert = ['Dosierung Inhaliert Leichte Dosis', 'Dosierung Inhaliert Mittlere Dosis', 'Dosierung Inhaliert Hohe Dosis']
wirkdauer_inhaliert = ['Wirkdauer Inhaliert Wirkungseintritt', 'Wirkdauer Inhaliert Peak', 'Wirkdauer Inhaliert Wirkdauer']
dose_geraucht = ['Dosierung Geraucht/Verdampft Leichte Dosis', 'Dosierung Geraucht/Verdampft Mittlere Dosis', 'Dosierung Geraucht/Verdampft Hohe Dosis']
wirkdauer_geraucht = ['Wirkdauer Geraucht/Verdampft Wirkungseintritt', 'Wirkdauer Geraucht/Verdampft Peak', 'Wirkdauer Geraucht/Verdampft Wirkdauer']

subs_dict = {}
for subst, y in substances_db.iterrows():
    subs_dict[subst] = y.to_dict()

    # Dose dataframe
    dose_dfor = pd.DataFrame.from_dict(y[dose_oral]).rename(columns={subst: 'Oral'})
    dose_dfor.index = dose_dfor.index.str.replace('Dosierung Oral ', '')
    dose_dfnas = pd.DataFrame.from_dict(y[dose_nasal]).rename(columns={subst: 'Nasal'})
    dose_dfnas.index = dose_dfnas.index.str.replace('Dosierung Nasal ', '')
    dose_dfinh = pd.DataFrame.from_dict(y[dose_inhaliert]).rename(columns={subst: 'Inhaliert'})
    dose_dfinh.index = dose_dfinh.index.str.replace('Dosierung Inhaliert ', '')
    dose_dfger = pd.DataFrame.from_dict(y[dose_geraucht]).rename(columns={subst: 'Geraucht/Verdampft'})
    dose_dfger.index = dose_dfger.index.str.replace('Dosierung Geraucht/Verdampft ', '')

    dose_df = dose_dfor.join(dose_dfnas).join(dose_dfinh).join(dose_dfger).dropna(axis='columns', how='all')

    # Wirkdauer dataframe
    wirk_dfor = pd.DataFrame.from_dict(y[wirkdauer_oral]).rename(columns={subst: 'Oral'})
    wirk_dfor.index = wirk_dfor.index.str.replace('Wirkdauer Oral ', '')
    wirk_dfnas = pd.DataFrame.from_dict(y[wirkdauer_nasal]).rename(columns={subst: 'Nasal'})
    wirk_dfnas.index = wirk_dfnas.index.str.replace('Wirkdauer Nasal ', '')
    wirk_dfinh = pd.DataFrame.from_dict(y[wirkdauer_inhaliert]).rename(columns={subst: 'Inhaliert'})
    wirk_dfinh.index = wirk_dfinh.index.str.replace('Wirkdauer Inhaliert ', '')
    wirk_dfger = pd.DataFrame.from_dict(y[wirkdauer_geraucht]).rename(columns={subst: 'Geraucht/Verdampft'})
    wirk_dfger.index = wirk_dfger.index.str.replace('Wirkdauer Geraucht/Verdampft ', '')

    wirkd_df = wirk_dfor.join(wirk_dfnas).join(wirk_dfinh).join(wirk_dfger).dropna(axis='columns', how='all')

    if "Dosierung comment" in y:
        subs_dict[subst]["comment"] = y["Dosierung comment"]
    elif "Dosierung Kommentar" in y:
        subs_dict[subst]["comment"] = y["Dosierung Kommentar"]
    else:
        subs_dict[subst]["comment"] = None
    subs_dict[subst]["dose_dict"] = dose_df.to_dict()
    subs_dict[subst]["wirkdauer_dict"] = wirkd_df.to_dict()

with open('substances_updated.json', 'w') as f:
    json.dump(subs_dict, f, indent=4, sort_keys=True, ensure_ascii=False, allow_nan=False)

with open('docs/assets/data/substances.json', 'w') as f:
    json.dump(subs_dict, f, indent=4, sort_keys=True, ensure_ascii=False, allow_nan=False)
