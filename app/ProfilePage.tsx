import AlertModal from "@/components/AlertModal";
import ChangePassModal from "@/components/ChangePassModal";
import ConfirmCurrPassModal from "@/components/ConfirmCurrPassModal";
import LogoutModal from "@/components/LogoutModal";
import NewProfileModal from "@/components/NewProfileModal";
import { useAuth } from "@/contexts/AuthContext";
import { IconEdit, IconUserFilled } from "@tabler/icons-react-native";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import api from "./services/api";

export default function ProfilePage() {
    
    const [alertModalVisible, setAlertModalVisible] = useState(false);
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);
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
    mutationFn: ({ storeName, name, profile_image }: { storeName: string; name: string, profile_image?: string | null; }) => {
        return api.put('/api/editprofile', {
        name: name,
        storeName: storeName,
        profile_image
        }).then(res => res.data);
    },
    onSuccess: async (data, variables) => {
        setHeaderText("Profile Updated Successfully");
        setAlertMessage("Your profile has been updated.");
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
                    {auth.user?.profile_image ? (
                        <Image
                            source={{ uri: auth.user.profile_image }}
                            style={{ width: '100%', height: '100%', borderRadius: 100 }}
                        />
                    ) : (
                        <IconUserFilled size={90} />
                    )}
                    <Pressable
                        style={styles.edit}
                        onPress={() => setChangeProfileModalVisible(true)}
                        accessibilityLabel="Edit profile"
                    >
                        <IconEdit size={20} color="#FFFFFF" />
                    </Pressable>
                </View>
                <View style={styles.boxContainer}>
                <Text style={styles.subheading}>Store Name:</Text>
                <View style={styles.inputBox}>
                    <TextInput value={auth.user?.storeName ?? "88 Chocolates and More"} editable={false}/>
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
                <View style={styles.footerContainer}>
                    <TouchableOpacity style={styles.buttons} onPress={() => setCurrPassModalVisible(true)}>
                        <Text style={styles.buttonText}>Change Password</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                    disabled={logoutMutation.isPending}
                    onPress={logoutModalVisible ? () => setLogoutModalVisible(false) : () => setLogoutModalVisible(true)}
                    style={styles.logoutButton}
                    >
                    <Text style={styles.buttonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {changeProfileModalVisible && (
            <NewProfileModal
            onSubmit={(storename, name, image) =>
            editProfileMutation.mutate({ storeName: storename, name: name, profile_image: image})
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
            {logoutModalVisible && (
                <LogoutModal
                onConfirm={() => logoutMutation.mutate()}
                onCancel={() => setLogoutModalVisible(false)}
                isLoading={logoutMutation.isPending}
                />
            )}
            
        </View>  
    );
}

const styles = StyleSheet.create({
   container: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
   },
   card: {
    borderColor: 'grey',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderTopStartRadius: 10,
    borderTopEndRadius: 10, 
    height: "93%",
    width: "95%",
    alignItems: 'center',
   },
   inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#412f2f',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 12,
    marginBottom: 15,
    height: 50,
   },
   profile: {
    marginVertical: 25,    
    borderWidth: 10,
    borderRadius: 100,
    borderColor: '#411C0E',
    position: 'relative',       
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 150,
    },
   edit: {
    position: 'absolute',    
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: '#565656',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    },
   subheading: {
    alignSelf: "flex-start",
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#411C0E'
   },
   boxContainer: {
    width: '90%'
   },
   footerContainer: {
    width: '90%',
    alignItems: 'center'
   },
   buttons: {
    backgroundColor: '#1A00FFB2',
    width: '100%',
    alignItems: 'center',
    borderRadius: 24,
    padding: 12,
    marginTop: 20,
   },
   logoutButton: {
    backgroundColor: '#B00B0BCC',
    width: '100%',
    alignItems: 'center',
    borderRadius: 24,
    padding: 12,
    marginVertical: 10,
   },
   buttonText: {
    color: '#fff',
    fontSize: 16
   },
   navigationBar:{
    position: 'absolute',
    bottom: 0
   }
})