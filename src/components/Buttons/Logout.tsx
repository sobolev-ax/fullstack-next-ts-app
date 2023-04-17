import { useUser } from '@/utils/swr'
import { Box, Button } from '@mui/material'

type Props = {
    closeModal?: () => void
}

export default function LogoutButton({ closeModal }: Props) {
    const { accessToken, mutate } = useUser();

    // обработчик нажатия кнопки
    const onClick = async () => {
        try {
            // сообщаем серверу о выходе пользователя из системы
            const response = await fetch('/api/auth/logout', {
                headers: {
                    // роут является защищенным
                    Authorization: `Bearer ${accessToken}`
                }
            })

            if (!response.ok) {
                throw response;
            }

            // инвалидируем кеш
            mutate({ user: undefined, accessToken: undefined });

            // закрываем модалку
            if (closeModal) {
                closeModal();
            }
        } catch(e) {
            console.log('LogoutButton', e);
        }
    }

    return (
        <Box display='flex' justifyContent='flex-end' pt={2} pr={2}>
            <Button color='error' variant='contained' onClick={onClick}>
                Logout
            </Button>
        </Box>
    )
}
