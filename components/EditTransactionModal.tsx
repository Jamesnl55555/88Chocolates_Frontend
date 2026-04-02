import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface EditTransactionModalProps {
    visible: boolean;
    transaction: any;
    onClose: () => void;
    onSubmit: (updatedTransaction: any) => void;
}

export default function EditTransactionModal({ visible, transaction, onClose, onSubmit }: EditTransactionModalProps) {
    const [editTransaction, setEditTransaction] = useState<any>(transaction);

    useEffect(() => { setEditTransaction(transaction); }, [transaction]);

    if (!editTransaction) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalBackdrop}>
                <View style={styles.modalContainer}>
                    <ScrollView>
                        <Text style={styles.title}>Edit Transaction</Text>

                        <Text>Total Amount:</Text>
                        <TextInput
                            style={styles.input}
                            value={String(editTransaction.total_amount)}
                            keyboardType="numeric"
                            onChangeText={(text) => setEditTransaction({ ...editTransaction, total_amount: text })}
                        />

                        <Text>Payment Method:</Text>
                        <TextInput
                            style={styles.input}
                            value={editTransaction.payment_method}
                            placeholder='Cash'
                            onChangeText={(text) => setEditTransaction({ ...editTransaction, payment_method: text })}
                        />

                        <View style={styles.buttons}>
                            <TouchableOpacity onPress={onClose}>
                                <Text style={styles.cancel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onSubmit(editTransaction)}>
                                <Text style={styles.save}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '90%', backgroundColor: '#fff', padding: 20, borderRadius: 10, maxHeight: '90%' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 5, marginBottom: 10 },
    buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    cancel: { color: 'red' },
    save: { color: 'green' },
});