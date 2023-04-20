
import streamlit as st
from streamlit_option_menu import option_menu


st.set_page_config(
     page_title="Vivid Substanzen",
     page_icon="https://pbs.twimg.com/profile_images/1396102254487384065/ZjD8GvMw_400x400.png",
     layout="wide", #centered wide
     initial_sidebar_state="expanded",
     menu_items={
         'Get Help': 'https://vivid-hamburg.de/kontakt/',
         'Report a bug': "https://github.com/ViewsOnDrugs/vivid_substanzen/tree/master",
         'About': "**App Author: [Francisco Arcila](https://twitter.com/franarsal/)** \n\nConcept design: Francisco Arcila."
     }
 )
# some users landed in the log area and couldn't easily go back
hide_menu_style = """
        <style>
        #MainMenu {visibility: hidden;}
        #MainMenu {visibility: hidden;}
        footer {visibility: hidden;}
        header {visibility: hidden;}
        </style>
        """
st.markdown(hide_menu_style, unsafe_allow_html=True)


#app.py
import de_substances, de_disclaimer, tripsit_combos, spenden

PAGES = {
    "Substanzen": de_substances,
    "Drug Combinations (EN)": tripsit_combos,
    "Wichtiger Hinweis": de_disclaimer,
    "Spenden": spenden,
}



vod_icon='[<img src="https://vivid-hamburg.de/wp-content/uploads/2020/05/logo_lang.jpg"  alt="centered image" class="center" width="300"/>](https://vivid-hamburg.de/)'
st.sidebar.markdown(vod_icon,  unsafe_allow_html=True)
#
title_alignment= ' <div style="text-align: center"> -Know your Drugs- </div>  '
#
st.sidebar.markdown(title_alignment, unsafe_allow_html=True)

with st.sidebar:
    selection = option_menu("", list(PAGES.keys()),
    icons=['file-earmark-text', 'exclamation-triangle', 'info-circle'], menu_icon="cast", default_index=0,
    styles={
        "nav-link": {"font-size": "16px", "text-align": "left", "margin":"0px"},
        "nav-link-selected": {"background-color": "ffffff"},
    })

# selection = st.sidebar.radio("",list(PAGES.keys()))
page = PAGES[selection]
page.main()
