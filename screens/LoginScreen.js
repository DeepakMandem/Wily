import React from 'react';
import { StyleSheet,
     Text, 
     View , 
     TouchableOpacity, 
     TextInput, 
     KeyboardAvoidingView, 
     Image} from 'react-native';
import firebase from 'firebase'
import db from '../Config'



export default class LoginScreen extends React.Component{

constructor(){
    super();

    this.state = {
        emailId : "",
        password : ""


    }
}

login =async(email,password)=>{
    if(email && password){
        try{
            const response = await firebase.auth().signInWithEmailAndPassword(email,password)

            if(response){
                this.props.navigation.navigate('Transaction')
            }
        }
        catch(error){
            switch(error.code){
                case 'auth/user-not-found' : Alert.alert("user doesn't exist")
                break
                case 'auth/invalid-email' : Alert.alert("incorrect email or password")
                break
            }

        }

        
        
    }else{
        Alert.alert("Enter Email and Password")
    }

    
}

render(){


    return(

        <KeyboardAvoidingView style={styles.Keyboard}>
            <View>
                <Image
                    source = {require("../assets/booklogo.jpg")}
                    style={styles.image}
                />
                <Text style={styles.textstyle}> Wily </Text>

            </View>
            
            <View>
                <TextInput style={styles.loginBox}
                    placeholder = "abc@example.com"
                    keyboardType = 'email-address'
                    onChangeText = {(text)=>{
                        this.setState({
                            emailId:text
                        })
                    }}                
                />

                <TextInput style={styles.loginBox}
                    placeholder = "enter password"
                    secureTextEntry = {true}
                    onChangeText = {(text)=>{
                        this.setState({
                            password:text
                        })
                    }}                
                />

                
            </View>

            <View>
                <TouchableOpacity style={styles.loginButton}
                    onPress={()=>{
                        this.login(this.state.emailId ,this.state.password)
                    }}>
                        <Text style={{textAlign:'center'}}> Login </Text>
                        
                </TouchableOpacity>
            </View>
        
        </KeyboardAvoidingView>

        
    )
}

}

const styles = StyleSheet.create({
    Keyboard:{
        alignItems:"center",
        padding:10,
        marginTop:20,
    },
    image:{
        width:200,
        height:200,

    },
    textstyle:{
        textAlign:"center",
        fontSize:30,

    },
    loginBox:{
        width:300,
        height:40,
        borderWidth: 1.5,
        fontSize: 20,
        margin: 10,
        paddingLeft: 10
    },
    loginButton:{
        width:90,
        height:30,
        borderWidth:1,
        topMargin:20,
        paddingTop:5,
        borderRadius:7
    }
})