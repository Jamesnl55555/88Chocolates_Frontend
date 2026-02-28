import { IconSquareCheckFilled, IconSquareFilled } from "@tabler/icons-react-native";
import React from "react";
import { Pressable } from "react-native";

export default function CheckboxComponent() { 
    const [checked, setChecked] = React.useState(false);

    const onToggle = () => {
        setChecked(!checked);
    };
    return (
        <Pressable onPress={onToggle} style={{ padding: 8 }}>
            {checked ? (
                <IconSquareCheckFilled size={24} color="#f1dfcf" />
            ) : (
                <IconSquareFilled size={24} color="#f1dfcf" />
            )}
        </Pressable>
    );
}