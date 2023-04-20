import streamlit as st


def main():

    st.title("VIVID Unterstützen")

    st.write("Wir als Harm-Reduction Verein setzen uns für sicheren und gesunden Substanzkonsum ein und jede Spende hilft uns, noch mehr Menschen zu erreichen. Vielen Dank für deine großartige Unterstützung!")

    col1, col2 = st.columns(2)

    with col1:
        if st.button('Bank Überweisung'):
            st.write("Name: VIVID e.V.")
            st.write("Iban: DE68 2512 0510 0001 7392 00")
            st.write("BIC: BFSWDE33HAN")


    with col2:
        if st.button("Paypal"):
            st.write("Demnächst...")
