import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  onLogin: () => void;
};

const SessionExpiredModal = ({ onLogin }: Props) => {
  return (
    <View style={styles.backdrop}>
      <View style={styles.container}>
        <Text style={styles.headerText}>Session Expired</Text>
        <Text style={styles.message}>
          Your session has expired for security reasons. Please log in again to continue.
        </Text>

        <TouchableOpacity onPress={onLogin} style={styles.button}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SessionExpiredModal;

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#411C0E80',
    zIndex: 2000,
  },
  container: {
    backgroundColor: '#fff',
    width: '90%',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    top: -40,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
    textAlign: 'center',
    color: '#443514',
  },
  message: {
    fontSize: 15,
    marginBottom: 25,
    marginHorizontal: 40,
    textAlign: 'center',
    color: '#333',
  },
  button: {
    backgroundColor: '#2FA262CC',
    paddingVertical: 12,
    alignItems: 'center',
    paddingHorizontal: 50,
    borderRadius: 30,
    marginBottom: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

