import React, { Component } from 'react';
import {
    View,
    ScrollView,
    KeyboardAvoidingView,
    Text,
    Dimensions,
    Linking,
    TouchableHighlight,
    PermissionsAndroid,
    Platform,
    StatusBar, StyleSheet, SafeAreaView, Clipboard, ToastAndroid,
} from "react-native";
import { LabelInput } from "../../../components/Forms";
import { BgView, Header } from "../../../components/Layouts";
import Button from "../../../components/Button/index";
import w3s from '../../../libs/Web3Service';
import { toWei } from '../../../libs/format';
import Web3 from 'web3';
import HydroToken from '../../../contracts/HydroToken.json'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { ThemeProvider } from '@react-navigation/native';
import { ethers, } from 'ethers';
import { Value } from 'react-native-reanimated';
import * as SecureStore from 'expo-secure-store';
import { DepositCard, } from "../../../components/cards";
import QRCode from 'react-native-qrcode-svg';

import { Table, TableWrapper, Row } from 'react-native-table-component';
import { HYDRO_PRIVATE_KEY } from '../../../constants';

const { height, width } = Dimensions.get('window');
//const Web3 = require("web3")

const _spender = "0xB0D5a36733886a4c5597849a05B315626aF5222E";

class BNBHistory extends Component {


    constructor(props) {
        super(props);
        this.state = {
            from: "",
            hydroaddress: "",
            amount: "",
            comments: "",
            isError: false,
            isSuccess: false,
            error: "",
            qrvalue: '',
            privatekeyValue: '',
            OpenScanner: false,
            balance: "",
            qrSection: false,
            history: [],
            //tableHead: ['Sent/Received', 'From/To', 'Value', 'Time', 'Conf'],
            tableHead: ['IN/OUT', 'Recipient', 'Value', 'Conf'],
            //widthArr: [80, 80, 60, 80, 60]
            widthArr: [90, 90, 120, 60]
        }
    }

    async componentDidMount() {
        w3s.initContract()
        this.retrieveData()
    }

    retrieveData = async () => {
        try {
            const value = await SecureStore.getItemAsync(HYDRO_PRIVATE_KEY);
            this.setState({ privatekeyValue: value })
            if (value !== null) {
                this.bnbhistory()
            }
        } catch (error) {

        }
    }

    bnbhistory = async () => {
        try {
            const walletAddress = this.props.route.params.walletToken;
            const tableData = [];

            let url = 'https://api.bscscan.com/api?module=account&action=txlist&address=' + walletAddress;

            fetch(url).then((response) => response.json()).then((history) => {

                history.result.forEach((tx) => {
                    const rowData = [];
                    let value = Web3.utils.fromWei(tx.value.toString())


                    tx.from = tx.from.toString()
                    if (tx.from.toLowerCase() === walletAddress.toLowerCase()) {
                        console.log(tx)

                        rowData.push('OUT')
                        rowData.push(tx.to)
                        rowData.push(value)
                        //rowData.push(Math.pow(16, tx.value._hex))
                        //rowData.push(tx.timestamp)
                        rowData.push(tx.confirmations)
                    } else {
                        console.log('tx.from', tx.from)
                        console.log('walletAddress', walletAddress)
                        rowData.push('IN')
                        rowData.push(tx.from)
                        rowData.push(value)
                        //rowData.push(Math.pow(16, tx.value._hex))
                        //rowData.push(tx.timestamp)
                        rowData.push(tx.confirmations)
                    }
                    tableData.push(rowData)
                    
                })
                console.log('history----------->', tableData)
                this.setState({ history: tableData })
                return history

            }).catch((error) => {
                console.error(error);
            });

        }
        catch (ex) {
            await this.setState({ isError: true })
            if (ex.message)
                await this.setState({ error: ex.message })
        }
    };


    onCopyToClipboard = async () => {
        await Clipboard.setString(this.props.route.params.walletToken);
        ToastAndroid.show("Copied To Clipboard!", ToastAndroid.SHORT);
    };
    onChange = (value) => {
        this.setState({ amount: value });
    }

    render() {
        console.log(this.props.route.params.walletToken, "Props")
        return (
            <BgView>
                <Header.Back title="BNB History" onBackPress={this.props.navigation.goBack} containerStyle={styles.header} />
                <View style={styles.container}>
                    <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                        <View style={{ paddingVertical: width * 0.02 }} />
                        <View style={styles.table_container}>
                            <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
                                <Row data={this.state.tableHead} widthArr={this.state.widthArr} style={styles.table_header} textStyle={styles.table_text} />
                            </Table>
                            <ScrollView style={styles.table_dataWrapper}>
                                <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
                                    {
                                        this.state.history.map((rowData, index) => (
                                            <Row
                                                key={index}
                                                data={rowData}
                                                widthArr={this.state.widthArr}
                                                style={[styles.table_row, index % 2 && { backgroundColor: '#F7F6E7' }]}
                                                textStyle={styles.table_text}
                                            />
                                        ))
                                    }
                                </Table>
                            </ScrollView>
                        </View>
                    </KeyboardAwareScrollView>
                </View>
            </BgView>

        );

    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: width * 0.05
    },

    header: {
        marginTop: Platform.OS == 'ios' ? 0 : StatusBar.currentHeight,
        paddingTop: 0,
        height: 50
    },

    button: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: width * 0.03,

    },
    qrcode: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: width * 0.05,
        marginBottom: width * 0.05,
        marginRight: width * 0.02,
    },

    table_container: { flex: 1, backgroundColor: '#fff' },
    table_header: { height: 50, backgroundColor: '#537791' },
    table_text: { textAlign: 'center', fontWeight: '100' },
    table_dataWrapper: { marginTop: -1 },
    table_row: { backgroundColor: '#E7E6E1' }

})

export default BNBHistory;