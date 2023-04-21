import streamlit as st


def main():

    st.title("VIVID Unterstützen")

    st.write("Wir als Harm-Reduction Verein setzen uns gemeinsam für mehr Gesundheitsförderung im Nachtleben, die Stärkung von Risiko- und Konsumkompetenzen unter jungen Erwachsenen, sowie eine rationale und evidenzbasierte Drogenpolitik ein. Jede Spende hilft uns, noch mehr Menschen zu erreichen. Vielen Dank für deine Unterstützung!")

    col1, col2 = st.columns(2)

    with col1:
        if st.button('Bank Überweisung'):
            st.write("Name: VIVID e.V.")
            st.write("Iban: DE68 2512 0510 0001 7392 00")
            st.write("BIC: BFSWDE33HAN")


    with col2:
        if st.button("PayPal"):
            st.write("Demnächst...")

    _,footcol, _ = st.columns(3)
    with footcol:
        foot = f' [<img src="https://vivid-hamburg.de/wp-content/uploads/2020/05/logo_lang.jpg" alt="drawing" width="400"/>](https://vivid-hamburg.de/)'
        st.markdown(foot, unsafe_allow_html=True)

