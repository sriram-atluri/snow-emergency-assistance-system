import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { auth } from '../firebaseConfig'; 


/*const resetScreen => {

    const handlePasswordReset{
        
    }
    
    return (
        <View style={styles.container}>
            <Text style={styles.forgotPass}>Forgot Password</Text>
            <Button
                title={'Continue'}
                onPress={handlePasswordReset}
                disabled={loading}
            />
        </View>
    );
}*/
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    forgotPass: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 40,
        textAlign: 'center',
      },
    input: {
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#ddd',
    }
})