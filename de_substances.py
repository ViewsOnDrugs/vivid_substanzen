import pandas as pd
import streamlit as st

add_emos = {"Oral oder nasal": "Oral :lips: oder nasal :pig_nose:",
            "Oral": "Oral :lips:",
            "Nasal oder intravenös, seltener auch oral": "Nasal :pig_nose:, oder intravenös :syringe:, seltener auch oral :lips:",
            "Oral oder sublingual": "Oral :lips: oder sublingual :tongue:",
            "Nasal, intravenös oder geraucht als Crack": "Nasal :pig_nose:, intravenös :syringe: oder geraucht als Crack :fog:",
            "Oral (gekaute Pilze, \r\nals Tee oder als Pulver in Kapseln)": "Oral :lips: (gekaute Pilze :mushroom:, als Tee :tea: oder als Pulver in Kapseln :pill:)"}



def load_data():
    subst_dic = pd.read_csv(
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vQM9INa12gkmzYivUzD4AqBpsYllL7Skehz6DdlqKWqVu3rPbYOA4IyFBo3q8IdswJNoUW7CmNLdZHs/pub?gid=1734089&single=true&output=csv").to_dict(
        orient="records")

    dict_to_render = {}

    for subst in subst_dic:
        wirkdauer_dict = {
            "Nasal": {
                "Wirkungseintritt": subst["Wirkdauer Nasal Wirkungseintritt"],
                "Peak": subst["Wirkdauer Nasal Peak"],
                "Wirkdauer": subst["Wirkdauer Nasal Wirkdauer"]
            },
            "Oral": {
                "Wirkungseintritt": subst["Wirkdauer Oral Wirkungseintritt"],
                "Peak": subst["Wirkdauer Oral Peak"],
                "Wirkdauer": subst["Wirkdauer Oral Wirkdauer"]
            }
        }

        dose_dict = {
            "Nasal": {
                "Hohe Dosis": subst["Dosierung Nasal Hohe Dosis"],
                "Leichte Dosis": subst["Dosierung Nasal Hohe Dosis"],
                "Mittlere Dosis": subst["Dosierung Nasal Hohe Dosis"]
            },
            "Oral": {
                "Hohe Dosis": subst["Dosierung Oral Hohe Dosis"],
                "Leichte Dosis": subst["Dosierung Oral Hohe Dosis"],
                "Mittlere Dosis": subst["Dosierung Oral Hohe Dosis"]
            }
        }

        dosis_ord = ["Leichte Dosis", "Mittlere Dosis", "Hohe Dosis"]
        wirk_ord = ["Wirkungseintritt", "Peak", "Wirkdauer"]



        dose_dic_clean = {x: dose_dict[x] for x in dose_dict if not pd.isnull(dose_dict[x]["Hohe Dosis"])}
        wirkdauer_dict_clean = {x: wirkdauer_dict[x] for x in wirkdauer_dict if
                                not pd.isnull(wirkdauer_dict[x]["Peak"])}

        subst["dose_df"] = pd.DataFrame.from_dict(dose_dic_clean).reindex(dosis_ord)
        subst["wirkdauer_df"] = pd.DataFrame.from_dict(wirkdauer_dict_clean).reindex(wirk_ord)

        subst['VIVID Safer-Use Tipps'] = subst['VIVID Safer-Use Tipps'].strip()

        dict_to_render[subst["Substanz"]] = subst

    return dict_to_render

subs_dict = load_data()
def main():
    drug_list = tuple(subs_dict.keys())

    head1, _, head2 = st.columns(3)

    with _:
        foot = f' [<img src="https://vivid-hamburg.de/wp-content/uploads/2020/05/logo_lang.jpg" alt="drawing" width="400"/>](https://vivid-hamburg.de/)'
        st.markdown(foot, unsafe_allow_html=True)

    st.info("Die digitale Version der VIVID-Substanzen-Flyer")

    st.write("##")


    col1, _, col2 = st.columns(3)


    with col1:
        substance = st.selectbox("Wählt eine Substanz aus", drug_list)
    with col2:
        st.markdown(f"# {substance}")


    st.info(f"###### {subs_dict[substance]['Beschreibung']}")

    col3, col4 = st.columns(2)

    with col3:

        st.markdown(f"#### {'Dosierung'}")
        st.table(subs_dict[substance]["dose_df"])

    with col4:

        st.markdown(f"#### {'Wirkdauer'}")
        st.table(subs_dict[substance]["wirkdauer_df"])

    st.markdown(f"###### {subs_dict[substance]['Dosierung Kommentar']}")

    st.markdown("---")
    col5, col6 = st.columns(2)


    var_text = add_emos[subs_dict[substance]["Konsumform"]]

    with col5:
        st.markdown(f"#### **Konsumform:**")
        st.markdown(f"###### {var_text.capitalize()}")
    var_text = subs_dict[substance]["Erscheinungsform"]
    with col6:
        st.markdown(f"#### **Erscheinungsform:**")
        st.markdown(f"###### {var_text.capitalize()}")
    # st.info(f"###### {var_text}")



    st.markdown("---")
    st.markdown("#### Wirkung")
    col_pos, col_neut, col_neg,  = st.columns(3)
    with col_pos:
        st.markdown(f'###### :white_check_mark: Positiv: {subs_dict[substance]["Wirkung Positiv"]}')
    with col_neut:
        st.markdown(f'###### :white_large_square: Neutral: {subs_dict[substance]["Wirkung Neutral"]}')
    with col_neg:
        st.markdown(f'###### :small_red_triangle: Negativ: {subs_dict[substance]["Wirkung Negativ"]}')

    st.markdown("---")
    st.markdown("#### Kombinationen:")

    # if len(subs_dict[substance]["Kombinationen"].split(";")) >= 4:
    #     st.warning(f'{subs_dict[substance]["Kombinationen"].split(";")[3]}')
    st.text("")
    col_pos_, col_neut_, col_neg_,  = st.columns(3)

    with col_pos_:
        st.markdown(f'###### :arrow_up_small: Verstärkt: {subs_dict[substance]["Kombinationen Verstärkt"]}')
    with col_neut_:
        st.markdown(f'###### :arrow_down_small: Verringert: {subs_dict[substance]["Kombinationen Verringert"]}')
    with col_neg_:
        st.markdown(f'###### :warning: Gefährlich: {subs_dict[substance]["Kombinationen Gefährlich"]}')

    st.markdown("---")
    for var in list(subs_dict[substance].keys()):
        if var in ["Toleranz","VIVID Safer-Use Tipps",]:
            var_text = subs_dict[substance][var]

            st.markdown(f"#### {var}:")
            st.markdown(f"{var_text}")


    _,footcol, _ = st.columns(3)
    with footcol:
        foot = f' [<img src="https://vivid-hamburg.de/wp-content/uploads/2020/05/logo_lang.jpg" alt="drawing" width="400"/>](https://vivid-hamburg.de/)'
        st.markdown(foot, unsafe_allow_html=True)
