import React from 'react';
import { StyleSheet, Text, View , TouchableOpacity, TextInput, KeyboardAvoidingView, ToastAndroid} from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner' 
import * as firebase from 'firebase'
import db from '../Config'


export default class TransactionScreen extends React.Component{

    constructor(){
        super();
        this.state = {
            hasCameraPermissions: null,
            scanned: false,
            scannedBookId: "",
            buttonState: "normal",
            scannedStudentId: "",
            transactionMessage:''
        }
    }
    getCameraPermissions = async (id) => {
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            hasCameraPermissions:status === 'granted',
            buttonState:id,
            scanned:false
        })
    }

    handleBarCodeScanned = async({type,data}) => {
       
       const {buttonState}=this.state
       if (buttonState === "BookId"){
            this.setState({
                scanned:true,
                scannedBookId:data,
                buttonState:normal
                
            })
       }
       if (buttonState === "StudentId"){
            this.setState({
                scanned:true,
                scannedStudentId:data,
                buttonState:normal
                
            })
       }   
    }

    initiateBookIssue = () => {
        db.collection("transaction").add({
            'studentId' : this.state.scannedStudentId,
            'bookId' : this.scannedBookId,
            'data' : firebase.fireStore.Timestamp.now().toDate(),
            'transactionType' : 'issue',

        })
        db.collection("books").doc(this.state.scannedBookId).update({
            bookAvailability:false
        })

        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(1)
        })

        this.setState({
            scannedStudentId: '',
            scannedBookId: '',
        })

    }

    initiateBookReturn = () => {
        db.collection("transaction").add({
            'studentId' : this.state.scannedStudentId,
            'bookId' : this.scannedBookId,
            'data' : firebase.fireStore.Timestamp.now().toDate(),
            'transactionType' : 'return',

        })
        db.collection("books").doc(this.state.scannedBookId).update({
            bookAvailability:true
        })

        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(-1)
        })

        this.setState({
            scannedStudentId: '',
            scannedBookId: '',
        })

    }

    checkStudentEligibilityForBookIssue = async()=>{
        const studentRef = await db
        .collection("students")
        .where("studentId","==",this.state.scannedStudentId)
        .get()

        var isStudentEligible = "";
        if(studentRef.docs.length == 0){
            this.setState({
                scannedStudentId: '',
                scannedBookId: '',
            })
            isStudentEligible = false;
        Alert.alert("Student Id doesnot exist in datatbase")
        }else{
            studentRef.docs.map((doc)=>{
                var student =doc.data();
                if(student.numberOfBooksIssued < 2){
                    isStudentEligible = true;
                }else{
                    isStudentEligible = false;
                    Alert.alert("the student has been already issued with 2 books")
                    this.setState({
                        scannedStudentId: '',
                        scannedBookId: '',
                    })
                }
            })
        }
        return isStudentEligible
    }

    checkStudentEligibilityForBookReturn = async()=>{
        const transactionRef = await db
        .collection("transaction")
        .where("bookId","==",this.state.scannedBookId)
        .limit(1)
        .get()
        

        var isStudentEligible = "";
       
            transactionRef.docs.map((doc)=>{
                var lastBookTransaction =doc.data();
                if(lastBookTransaction.studentId === this.state.scannedStudentId){
                    isStudentEligible = true;
                }else{
                    isStudentEligible = false;
                    Alert.alert("This book wasn't issued by this student")
                    this.setState({
                        scannedStudentId: '',
                        scannedBookId: '',
                    })
                }
            })
        
        return isStudentEligible
    }

    checkBookEligibility = async()=>{
        const bookRef = await db
        .collection("books")
        .where("bookId","==",this.state.scannedBookId)
        .get()

        var transactionType = ""
        if(bookRef.docs.length==0){
            transactionType = false
        }else{
            bookRef.docs.map(()=>{
                var book = doc.data
                if(book.bookAvailability){
                    transactionType = "Issue"
                }else{
                    transactionType = "Return"
                }
                
            })
        }
        return transaction
    }

    

    handleTransaction =async()=>{
        //verify if the student is eligible for book issue or return or none
        //student id exists in the database
        //issue : number of book issued < 2
        //issue: verify book availability
        //return: last transaction -> book issued by the student id

        var transactionType = await this.checkBookEligibility();

        if(!transactionType){
            Alert.alert("The book doesnot exist in database");
            this.setState({
                scannedStudentId: '',
                scannedBookId: '',
            })
        }

        else if(transactionType === "Issue"){
            var isStudentEligible = await this.checkStudentEligibilityForBookIssue();
            if(isStudentEligible){
                this.initiateBookIssue();
                Alert.alert("Book is sissued to the student")
            }
        }

        else{
            var isStudentEligible = await this.checkStudentEligibilityForBookReturn();
            if(isStudentEligible){
                this.initiateBookReturn();
                Alert.alert("Book is returned to the student")
            }
        }

    }







    /*
    handleTransaction = async () => {
        var transactionMessage
        db.collection("books").doc(this.state.scannedBookId).get()
        .then((doc)=>{
            console.log(doc.data)

            var book =doc.data();
            if(book.bookAvailability){
                this.initiateBookIssue();
                transactionMessage ="Book Issued"
                //Alert.alert(transactionMessage)
                ToastAndroid.show(transactionMessage, ToastAndriod,SHORT)
            }else{
                this.initiateBookReturn();
                transactionMessage="Book Returned"
                Alert.alert(transactionMessage)
                ToastAndroid.show(transactionMessage, ToastAndroid.SHORT);
            }
            
        })

        this.setState({
            transactionMessage:transactionMessage
        })
    }

    */

    

    
    render(){
        const hasCameraPermissions =this.state.hasCameraPermissions;
        const scanned = this.state.scanned;
        const buttonState = this.state.buttonState;

        if(buttonState!= 'normal' && hasCameraPermssions){
            return(
                <BarCodeScanner
                    onBarCodeScanned = {
                        scanned ? undefined: this.handleBarCodeScanned}
                        style ={StyleSheet.absoluteFillObject}
                />
            )
        }
        else if(buttonState === 'normal'){   
            
            return(
                <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
                    <View style={styles.container}> 
                        <Image
                            source = {require('../assets/book.png')}
                            style={{width:200,height:200}}
                        />
                        <Text style={{textAlign:'center',fontSize:'30'}}> Wily </Text>                                             

                        <View style = {styles.inputView}>
                            <TextInput 
                                style={styles.inputBox}
                                placeholder = "Book Id"
                                onChangeText = {
                                    text => {
                                        this.setState({
                                            
                                            scannedBookId:text})
                                    }
                                }
                                value={this.state.scannedBookId}
                               
                               
                                />
                            
                            <TouchableOpacity 
                                style = {styles.scanButton}
                                onPress={()=>{
                                    this.getCameraPermissions("BookId")
                                }}
                                >
                                <Text style={styles.buttonText}> Scan </Text>
                            </TouchableOpacity>                            
                        </View>
                        
                        <View style = {styles.inputView}>   
                            <TextInput 
                                style={styles.inputBox}
                                placeholder = "Student Id"
                                onChangeText = {
                                    text => {
                                        this.setState({
                                         scannedStudentId:text})
                                    }
                                }
                                value={this.state.scannedStudentId}
                                />
                            <TouchableOpacity 
                                style = {styles.scanButton}
                                onPress={()=>{
                                    this.getCameraPermissions("StudentId")
                                }}>
                                <Text style={styles.buttonText}> Scan </Text>

                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity 
                            style ={styles.submitButton}
                            onPress={async()=>{
                                var transactioMessage = this.handleTransaction
                                this.setState({
                                        scannedBookId:'',
                                     scannedStudentId:''
                                    })
                            }}
                            >
                            <Text style={styles.buttonText}> Submit </Text>
                        </TouchableOpacity>

                    </View>
                </KeyboardAvoidingView>
            )
        }
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
        width:100,
        height:50,
        backgroundColor:"red"
    }
  });