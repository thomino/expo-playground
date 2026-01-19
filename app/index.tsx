import { Link } from 'expo-router';
import { ScrollView, View, Text, Pressable } from 'react-native';
import Header from '@/components/Header';
import Feather from '@expo/vector-icons/Feather';
import useThemeColors from '@/app/contexts/ThemeColors';
import '../global.css';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';
import { Feather as FeatherIcons } from '@expo/vector-icons';
type FeatherIconName = keyof typeof FeatherIcons.glyphMap;

export default function Home() {
    const insets = useSafeAreaInsets();

    return (
        <>
            <Header hasAvatar />
            <ScrollView style={{ paddingTop: insets.top + 0 }} className='px-6 pt-0  bg-background'>
                <View className='mb-14 mt-0 px-4'>
                    <Text className='text-5xl font-bold text-text'>Hello there!</Text>
                    <Text className='text-text text-lg opacity-50'>Welcome to my playground</Text>
                </View>
                <LinkItem href='/screens/product' icon='shopping-cart' title='Product' description='Procuct details' />
                <LinkItem href='/screens/dropdown' icon='chevron-down' title='Dropdown' description='Expandable dropdown' />
                <LinkItem href='/screens/card-flip' icon='box' title='Card Flip' description='3d card flip' />
                <LinkItem href='/screens/expandable-tabs-image' icon='book-open' title='Expandable Tabs' description='Expandable tabs' />
                <LinkItem href='/screens/product-grid' icon='shopping-bag' title='Product Grid' description='Animated filter' />
                <LinkItem href='/screens/gradient' icon='droplet' title='Theme carousel' description='Theme picker' />
                <LinkItem href='/screens/onboarding' icon='copy' title='Onboarding' description='Introduction slider' />
                <LinkItem href='/screens/switch' icon='toggle-left' title='Switch' description='Toggle switch' />
                <LinkItem href='/screens/parallax' icon='layers' title='Parallax' description='Parallax scroller' />
                <LinkItem href='/screens/weather' icon='cloud' title='Weather' description='weather app' />
                <LinkItem href='/screens/masonry' icon='grid' title='Masonry grid' description='Simple image or card layout' />
                <LinkItem href='/screens/card' icon='square' title='Card' description='Card counter' />
                <LinkItem href='/screens/chart' icon='bar-chart' title='Chart counter' description='Eearnings chart' />
                <LinkItem href='/screens/video-card' icon='play' title='Video card' description='Expandable card' />
                <LinkItem href='/screens/bottom-bar' icon='git-commit' title='Bottom bar' description='Switcher' />
                <LinkItem href='/screens/journal-cards' icon='square' title='Journal cards' description='Journal cards' />
                <View className='h-44' />
            </ScrollView>
        </>
    );
}


interface LinkItemProps {
    href: string;
    icon: FeatherIconName;
    title: string;
    description: string;
    comingSoon?: boolean;
}

const LinkItem = ({ href, icon, title, description, comingSoon = false }: LinkItemProps) => {
    const colors = useThemeColors();
    return (
        <Link href={href} asChild>
            <Pressable
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.07,
                    shadowRadius: 3.84,
                    elevation: 5,
                }}
                className='flex-row items-center bg-secondary rounded-3xl px-4 py-4 mb-3'>
                <View className='w-12 h-12 bg-background flex items-center justify-center rounded-full'>
                        <Feather name={icon} size={18} color={colors.icon} />
                </View>
                <View className='justify-center ml-4'>
                    <View className='flex-row items-center'>
                        <Text className='text-base font-bold text-text'>{title}</Text>
                        {comingSoon &&
                            <View className='bg-sky-500 rounded-full px-2 py-[3px] ml-2'>
                                <Text className='text-xs text-white'>Soon</Text>
                            </View>
                        }
                    </View>
                    <Text className='text-sm text-text opacity-50'>{description}</Text>
                </View>
                <View className='ml-auto opacity-30'>
                    <Feather name='chevron-right' size={20} color={colors.icon} />
                </View>
            </Pressable>
        </Link>
    )
}