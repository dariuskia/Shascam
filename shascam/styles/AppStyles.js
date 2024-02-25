import {StyleSheet} from 'react-native'

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        alignItems: "center",
        padding: 60,
        paddingTop: 100
    },
    input: {
        backgroundColor: '#b86ffc',
        color: '#20004A',
        padding: 2,
        width: '95%',
    },
    viewBox: {
        backgroundColor: "#CBC3E3",
        shadowOpacity: 0.5,
        opacity: 0.75, 
        borderRadius: 16,
        shadowOpacity: 0.5,
        padding: 12,
        marginLeft: 10,
        marginRight: 10,
        margin: 20
    },

    viewBoxLabel: {
        fontSize: 20,
        color: "#20004A",
        fontWeight: "bold"
    },

    viewBoxText: {
        fontSize: 15,
        color: "#20004A"
    }
})