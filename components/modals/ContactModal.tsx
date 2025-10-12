import { useTheme } from "@/providers/themeContext";
import { MessageCircleWarning, X } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ContactModalProps {
    expanded?: (expanded: boolean) => void;
}

interface FormData {
    name: string;
    email: string;
    message: string;
}

export const ContactModal = ({ expanded }: ContactModalProps) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
        reset,
        watch,
    } = useForm<FormData>({
        defaultValues: {
            name: "",
            email: "",
            message: "",
        },
        mode: "onTouched",
    });

    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const apiKey = process.env.EXPO_PUBLIC_FORM_KEY || "";

    const message = watch("message");

    const onSubmit = async (data: FormData) => {
        if (!apiKey) {
            Alert.alert(t('contactModal.alerts.apiKeyMissing.title'), t('contactModal.alerts.apiKeyMissing.message'));
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
                    name: data.name,
                    email: data.email,
                    message: data.message,
                    from_name: "Contact",
                    subject: "New Contact Message from Huddle.",
                }),
            });

            const result = await response.json();

            if (result.success) {
                reset();
                setIsOpen(false);
                if (expanded) expanded(false);
                Alert.alert(t('contactModal.alerts.success.title'), t('contactModal.alerts.success.message'));
            } else {
                Alert.alert(t('contactModal.alerts.error.title'), result.message || t('contactModal.alerts.error.message'));
            }
        } catch {
            Alert.alert(t('contactModal.alerts.error.title'), t('contactModal.alerts.error.message'));
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
                className="px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700/50"
            >
                <MessageCircleWarning size={24} color="#9CA3AF" />
            </Pressable>

            <Modal
                visible={isOpen}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView className="flex-1 bg-gradient-to-b from-black to-gray-900">
                    <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800/50">
                        <Pressable
                            onPress={() => {
                                setIsOpen(false);
                                if (expanded) expanded(false);
                            }}
                            className="p-2"
                        >
                            <X size={24} color="#9CA3AF" />
                        </Pressable>
                        <Text className="text-white font-semibold text-lg">{t('contactModal.title')}</Text>
                        <Pressable
                            onPress={handleSubmit(onSubmit)}
                            disabled={!isValid || isSubmitting}
                            className={`px-4 py-2 rounded-full`}
                            style={{
                                opacity: isValid && !isSubmitting ? 1 : 0.5,
                                backgroundColor: isValid && !isSubmitting ? colors.primary : colors.borderVariant,
                            }}
                        >
                            <Text className="text-white font-medium text-sm">
                                {isSubmitting ? t('contactModal.sending') : t('contactModal.sendMessage')}
                            </Text>
                        </Pressable>
                    </View>

                    <ScrollView className="flex-1 px-4">
                        <View className="pt-6 pb-20">
                            {/* Name Field */}
                            <View className="mb-6">
                                <Text className="text-gray-300 font-medium text-base mb-3">{t('contactModal.fullName')}</Text>
                                <Controller
                                    control={control}
                                    name="name"
                                    rules={{
                                        required: t('contactModal.errors.fullNameRequired'),
                                        maxLength: {
                                            value: 80,
                                            message: t('contactModal.errors.fullNameMaxLength'),
                                        },
                                    }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            placeholder={t('contactModal.placeholders.fullName')}
                                            placeholderTextColor="#6B7280"
                                            autoComplete="off"
                                            className={`bg-gray-800/50 border ${errors.name ? "border-pink-600" : "border-gray-700/50"
                                                } text-white px-4 py-3 rounded-lg text-base`}
                                        />
                                    )}
                                />
                                <View className="flex-row items-center justify-between mt-1">
                                    {errors.name ? (
                                        <Text className="text-pink-600 text-xs">{errors.name.message}</Text>
                                    ) : (
                                        <Text className="text-gray-400 text-xs">
                                            {watch("name")?.length || 0}/80
                                        </Text>
                                    )}
                                </View>
                            </View>

                            {/* Email Field */}
                            <View className="mb-6">
                                <Text className="text-gray-300 font-medium text-base mb-3">{t('contactModal.email')}</Text>
                                <Controller
                                    control={control}
                                    name="email"
                                    rules={{
                                        required: t('contactModal.errors.emailRequired'),
                                        pattern: {
                                            value: /^\S+@\S+$/i,
                                            message: t('contactModal.errors.emailInvalid'),
                                        },
                                    }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            placeholder={t('contactModal.placeholders.email')}
                                            placeholderTextColor="#6B7280"
                                            keyboardType="email-address"
                                            autoComplete="off"
                                            className={`bg-gray-800/50 border ${errors.email ? "border-pink-600" : "border-gray-700/50"
                                                } text-white px-4 py-3 rounded-lg text-base`}
                                        />
                                    )}
                                />
                                {errors.email && (
                                    <Text className="text-pink-600 text-xs mt-1">{errors.email.message}</Text>
                                )}
                            </View>

                            {/* Message Field */}
                            <View className="mb-6">
                                <Text className="text-gray-300 font-medium text-base mb-3">{t('contactModal.message')}</Text>
                                <Controller
                                    control={control}
                                    name="message"
                                    rules={{ required: t('contactModal.errors.messageRequired') }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            placeholder={t('contactModal.placeholders.message')}
                                            placeholderTextColor="#6B7280"
                                            multiline
                                            numberOfLines={3}
                                            textAlignVertical="top"
                                            maxLength={200}
                                            className={`bg-gray-800/50 border ${errors.message ? "border-pink-600" : "border-gray-700/50"
                                                } text-white px-4 py-3 rounded-lg text-base`}
                                        />
                                    )}
                                />
                                <View className="flex-row items-center justify-between mt-1">
                                    {errors.message ? (
                                        <Text className="text-pink-600 text-xs">{errors.message.message}</Text>
                                    ) : (
                                        <Text className="text-gray-400 text-xs">
                                            {message?.length || 0}/200
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </>
    );
};