import AlertModal from "@/components/AlertModal";
import ChangePassModal from "@/components/ChangePassModal";
import ConfirmCurrPassModal from "@/components/ConfirmCurrPassModal";
import NewProfileModal from "@/components/NewProfileModal";
import { useAuth } from "@/contexts/AuthContext";
import { IconEdit, IconUserFilled } from "@tabler/icons-react-native";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import api from "./services/api";

export default function ProfilePage() {
    
    const [alertModalVisible, setAlertModalVisible] = useState(false);
    const [logoutModal, setLogoutModal] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [headerText, setHeaderText] = useState('');
    const [changeProfileModalVisible, setChangeProfileModalVisible] = useState(false);
    const [currPassModalVisible, setCurrPassModalVisible] = useState(false);
    const [changePassModalVisible, setChangePassModalVisible] = useState(false);

    const router = useRouter();
    const auth = useAuth();
        useEffect(() => {
        if (!auth.restoring && !auth.isAuthenticated) {
                router.replace('/LoginPage');
        }
        }, [auth.restoring, auth.isAuthenticated]);
    const logoutMutation = useMutation({
        mutationFn: () => api.post('/api/logout'),
        onSettled: async (data, error) => {
            if (error) {
            console.error('Logout API failed', error);
            } else {
            console.log('Logged out!', data);
            }

            await auth.signOut();
        },
    });

    const editProfileMutation = useMutation({
    mutationFn: ({ storeName, name }: { storeName: string; name: string }) => {
        return api.put('/api/editprofile', {
        name: name,
        storeName: storeName,
        }).then(res => res.data);
    },
    onSuccess: async (data, variables) => {
        setAlertModalVisible(true);
        await auth.updateUser(data.user);
        setChangeProfileModalVisible(false);
    },
    onError: (error: any) => {
        console.log("STATUS:", error?.response?.status);
        console.log("DATA:", error?.response?.data);
        console.log("FULL ERROR:", error);
    }
    });

    const changePassword = useMutation ({
        mutationFn: ({password, password_confirmation}: {password: string, password_confirmation: string}) => {
            return api.put('/api/changePass', {password, password_confirmation}).then(res => res.data);
        },
        onSuccess: async (data) => {
            setChangePassModalVisible(false);
            setAlertModalVisible(true);
            setHeaderText('Password Changed Successfully');
            setAlertMessage('Your password has been updated.');
        },
        onError: async (error: any) => {
            console.error('Change Password API failed', error?.response?.status);
            alert(error?.response?.status);
        }
    });

    const currPassSubmit = useMutation ({
        mutationFn: ({password}: {password: string}) => {
            return api.post('/api/confPass', {password}).then(res => res.data);
        },
        onSuccess: async (data) => {
            setCurrPassModalVisible(false);
            setChangePassModalVisible(true);
        },
        onError: async (error: any) => {
            console.error('Change Password API failed', error?.response?.status);
            alert(error?.response?.status);
        }
    });

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.profile}>
                    <IconUserFilled size={90} />
                    <Pressable
                        style={styles.edit}
                        onPress={() => setChangeProfileModalVisible(true)}
                        accessibilityLabel="Edit profile"
                    >
                        <IconEdit size={20} color="#724848" />
                    </Pressable>
                </View>
                <View style={styles.boxContainer}>
                <Text style={styles.subheading}>Store Name:</Text>
                <View style={styles.inputBox}>
                    <TextInput value={auth.user?.storeName ?? "88 Chocolates and more"} editable={false}/>
                </View>
                <Text style={styles.subheading}>Username:</Text>
                <View style={styles.inputBox}>
                    <TextInput value={auth.user?.name ?? "Username"}  editable={false}/>
                </View>
                <Text style={styles.subheading}>Email:</Text>
                <View style={styles.inputBox}>
                    <TextInput value={auth.user?.email ?? "user@example.com"} editable={false}/>
                </View>
                </View>
                <View>
                    <TouchableOpacity style={styles.buttons} onPress={() => setCurrPassModalVisible(true)}>
                        <Text>Change Password</Text>
                    </TouchableOpacity>
                    <Button
                    title={logoutMutation.isPending ? "Logging out..." : "Logout"}
                    disabled={logoutMutation.isPending}
                    onPress={() => logoutMutation.mutate()}
                    />
                </View>
                
            </View>
            {changeProfileModalVisible && (
            <NewProfileModal
            onSubmit={(storename, name) =>
            editProfileMutation.mutate({ storeName: storename, name: name })
            }
            onCancel={() => setChangeProfileModalVisible(false)}
            isSaving={editProfileMutation.isPending}
            />
            )}

            {currPassModalVisible && (
            <ConfirmCurrPassModal
            onSubmit={(password) =>
            currPassSubmit.mutate({ password: password })
            }
            onCancel={() => setCurrPassModalVisible(false)}
            isLoading={currPassSubmit.isPending}
            />
            )}

            {changePassModalVisible && (
                <ChangePassModal
                onSubmit={(password, password_confirmation) =>
                changePassword.mutate({ password: password, password_confirmation: password_confirmation })
                }
                onCancel={() => setChangePassModalVisible(false)}
                isLoading={changePassword.isPending}
                />
            )}
            {alertModalVisible && (
                <AlertModal
                message={alertMessage}
                headertext={headerText}
                onConfirm={() => setAlertModalVisible(false)}
                />
            )}
            
        </View>  
    );
}

const styles = StyleSheet.create({
   container: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center' 
   },
   card: {
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 45,
    height: "90%",
    width: "90%",
    alignItems: 'center'

   },
   inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7dddd',
    borderColor: '#412f2f',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 12,
    marginBottom: 5
   },
   profile: {
    marginVertical: 50,
    borderColor: 'brown',
    borderWidth: 7,
    borderRadius: 60,
    padding: 9,
    position: 'relative',       
    alignItems: 'center',
    justifyContent: 'center',
    },
   edit: {
    position: 'absolute',    
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#a7a4a4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    },
   subheading: {
    alignSelf: "flex-start",
    fontWeight: 'bold',
   },
   boxContainer: {
    width: '90%'
   },
   buttons: {
    backgroundColor: '#e7dddd',
    borderColor: '#412f2f',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 12,
    marginVertical: 10,
   },
})