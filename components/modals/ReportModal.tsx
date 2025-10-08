import { reportTopics } from "@/consts/reportTopics";
import { useTheme } from "@/providers/themeContext";
import { ChevronDown, MessageCircleWarning, X } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    Select,
    SelectBackdrop,
    SelectContent,
    SelectInput,
    SelectItem,
    SelectPortal,
    SelectTrigger,
} from "../ui/select";

interface UserReportProps {
    expanded?: (expanded: boolean) => void;
    userId: string;
}

interface FormData {
    user_id: string;
    email: string;
    reason: string;
    message: string;
}

export const ReportModal = ({ expanded, userId }: UserReportProps) => {
    const { colors } = useTheme();
    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
        reset,
        trigger,
        watch,
    } = useForm<FormData>({
        defaultValues: {
            user_id: userId,
            email: "",
            reason: "",
            message: "",
        },
        mode: "onChange",
    });

    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const apiKey = process.env.EXPO_PUBLIC_FORM_KEY || "";

    const message = watch("message");

    const onSubmit = async (data: FormData) => {
        if (!apiKey) {
            Alert.alert("Error", "API key is missing. Please contact support.");
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    access_key: apiKey,
                    user_id: data.user_id,
                    email: data.email,
                    reason: data.reason,
                    message: data.message,
                    from_name: "Reports",
                    subject: "New user report",
                }),
            });

            const result = await response.json();

            if (result.success) {
                reset();
                setIsOpen(false);
                if (expanded) expanded(false);
                Alert.alert("Success", "Report sent successfully!");
            } else {
                Alert.alert("Error", result.message || "Failed to send report. Please try again later.");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to send report. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Pressable
                onPress={() => {
                    setIsOpen(true);
                    if (expanded) expanded(true);
                }}
                className="px-4">
                <MessageCircleWarning size={24} color={colors.textMuted} />
            </Pressable>

            <Modal
                visible={isOpen}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
                    <View className="flex-row items-center justify-between px-4 py-3 border-b" style={{ borderColor: colors.border }}>
                        <Pressable
                            onPress={() => {
                                setIsOpen(false);
                                if (expanded) expanded(false);
                            }}
                            className="p-2"
                        >
                            <X size={24} color={colors.textMuted} />
                        </Pressable>
                    </View>

                    <ScrollView className="flex-1 px-4">
                        <View className="pt-6 pb-20">
                            {/* Hidden User ID Field */}
                            <Controller
                                control={control}
                                name="user_id"
                                rules={{ required: "User ID is required" }}
                                render={({ field: { value } }) => (
                                    <TextInput
                                        value={value}
                                        className="hidden"
                                        editable={false}
                                    />
                                )}
                            />
                            {errors.user_id && (
                                <Text className="text-pink-600 text-xs mt-1">{errors.user_id.message}</Text>
                            )}

                            {/* Email Field */}
                            <View className="mb-6">
                                <Text className="font-medium text-base mb-3" style={{ color: colors.text }}>Email</Text>
                                <Controller
                                    control={control}
                                    name="email"
                                    rules={{
                                        required: "Enter your email so we can respond to you",
                                        pattern: {
                                            value: /^\S+@\S+$/i,
                                            message: "Please enter a valid email",
                                        },
                                    }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            placeholder="Enter your email"
                                            placeholderTextColor={colors.textMuted}
                                            keyboardType="email-address"
                                            autoComplete="off"
                                            className="px-4 py-3 rounded-lg text-base"
                                            style={{ backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: errors.email ? colors.accentSecondary : colors.border, color: colors.text }}
                                        />
                                    )}
                                />
                                {errors.email && (
                                    <Text className="text-xs mt-1" style={{ color: colors.accentSecondary }}>{errors.email.message}</Text>
                                )}
                            </View>

                            {/* Reason Field */}
                            <View className="mb-6">
                                <Text className="font-medium text-base mb-3" style={{ color: colors.text }}>Reason</Text>
                                <Controller
                                    control={control}
                                    name="reason"
                                    rules={{ required: "Reason is required" }}
                                    render={({ field: { onChange, value } }) => (
                                        <Select
                                            selectedValue={value}
                                            onValueChange={(val) => {
                                                onChange(val);
                                                trigger("reason");
                                            }}
                                        >
                                            <SelectTrigger
                                                className="rounded-lg flex-row items-center justify-between px-4 py-3"
                                                style={{ backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: errors.reason ? colors.accentSecondary : colors.border }}
                                            >
                                                <SelectInput
                                                    placeholder="Select reason"
                                                    placeholderTextColor={colors.textMuted}
                                                    value={value}
                                                    className="flex-1"
                                                    style={{ color: colors.text }}
                                                />
                                                <ChevronDown size={24} color={colors.textMuted} />
                                            </SelectTrigger>
                                            <SelectPortal>
                                                <SelectBackdrop />
                                                <SelectContent>
                                                    {reportTopics.map((topic, index) => (
                                                        <SelectItem
                                                            key={index}
                                                            label={topic}
                                                            value={topic}
                                                            className="px-4 py-3"
                                                        />
                                                    ))}
                                                </SelectContent>
                                            </SelectPortal>
                                        </Select>
                                    )}
                                />
                                {errors.reason && (
                                    <Text className="text-xs mt-1" style={{ color: colors.accentSecondary }}>{errors.reason.message}</Text>
                                )}
                            </View>

                            {/* Message Field */}
                            <View className="mb-6">
                                <Text className="font-medium text-base mb-3" style={{ color: colors.text }}>Description</Text>
                                <Controller
                                    control={control}
                                    name="message"
                                    rules={{ required: "Description is required" }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            placeholder="Describe the issue..."
                                            placeholderTextColor={colors.textMuted}
                                            multiline
                                            numberOfLines={3}
                                            textAlignVertical="top"
                                            maxLength={200}
                                            className="px-4 py-3 rounded-lg text-base"
                                            style={{ backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: errors.message ? colors.accentSecondary : colors.border, color: colors.text }}
                                        />
                                    )}
                                />
                                <View className="flex-row items-center justify-between mt-1">
                                    {errors.message ? (
                                        <Text className="text-xs" style={{ color: colors.accentSecondary }}>{errors.message.message}</Text>
                                    ) : (
                                        <Text className="text-xs" style={{ color: colors.textMuted }}>{message?.length || 0} / 200</Text>
                                    )}
                                </View>
                            </View>
                            <Pressable
                                onPress={handleSubmit(onSubmit)}
                                disabled={!isValid || isSubmitting}
                                className={`px-4 py-2 rounded-full w-fit self-end ${isValid && !isSubmitting ? '' : 'opacity-50'}`}
                                style={{ backgroundColor: colors.accent }}
                            >
                                <Text className="font-medium text-sm" style={{ color: colors.white }}>
                                    {isSubmitting ? "Sending..." : "Send Report"}
                                </Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </>
    );
};