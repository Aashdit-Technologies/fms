// GlobalStyle.js
import { createGlobalStyle } from "styled-components";

const GlobalStyleFont = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body, span,p,h1,h2,h3,h4,h5,h6 ,label,select,option,input,textarea,button,a ,li,ul,ol,dl,dt,dd ,table,th,td ,tr,thead,tfoot,tbody,form,fieldset,legend,article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section,summary {
    font-family: "Open Sans", Arial, sans-serif;
  }
    p,span{
      font-size: 14px;
      font-weight: 600;
    }
`;

export default GlobalStyleFont;
