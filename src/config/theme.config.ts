import { ThemeConfig } from 'antd/es/config-provider/context'

export const customTheme: ThemeConfig = {
    token: {
        fontFamily: "sans-serif",
        colorPrimary: "#a62a22",
        colorTextBase:"rgba(0,0,0,1)",
        colorBgBase: "rgba(255, 255,255,0.9)",
      
    },
    components: {
        Input: {
            fontSize: 14,
            borderRadius: 4,
          },
          Button: {
            fontSize: 14,
            borderRadius: 4,
            fontWeightStrong: 400
          },
          Select: {
            borderRadius: 4,
          },
          DatePicker: {
            borderRadius: 2,
          },    
    }
}
