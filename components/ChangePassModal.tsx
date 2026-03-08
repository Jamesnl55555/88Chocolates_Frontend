import { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import EyeComponent from './EyeComponent';
type Props = {
    onSubmit: (password: string, passwordConfirmation: string) => void;
    onCancel?: () => void;
    isLoading: boolean;
    confirmError?: string | null;
    passwordError?: string | null;
}

export default function ChangePassModal({ onSubmit, onCancel, isLoading, confirmError, passwordError }: Props) {
    const [password, setPassword] = useState("");
    const [password_confirmation, setPasswordConfirmation] = useState("");
    return (
        <View style={styles.container}>
            <View>
                <Text>Create New Password</Text>
                <Text>Please enter your new strong password from your account.</Text>
            </View>
            <View>
                <View>
                    <Text>Password:</Text>
                    <TextInput placeholder="***********" secureTextEntry={true} onChangeText={setPassword}/>
                    <EyeComponent toggleVisibility={() => { }} isVisible={false} />
                </View>
                <View>
                    <Text>Confirm Password:</Text>
                    <TextInput placeholder="***********" secureTextEntry={true} onChangeText={setPasswordConfirmation}/>
                    <EyeComponent toggleVisibility={() => { }} isVisible={false} />
                </View>
            </View>
            <View>
                <TouchableOpacity onPress={() => onSubmit(password, password_confirmation)} disabled={isLoading}>
                    <Text>{isLoading ? "Changing..." : "Continue"}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onCancel}>
                    <Text>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
    }
}
)