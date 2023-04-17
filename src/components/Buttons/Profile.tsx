import { useUser } from '@/utils/swr'
import { Avatar, ListItemButton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import AuthTabs from '../AuthTabs'
import Modal from '../Modal'
import UserPanel from '../UserPanel'

export default function ProfileButton() {
  // запрашиваем данные пользователя
  const { user } = useUser()
  const theme = useTheme()

  // содержимое модального окна зависит от наличия данных пользователя
  const modalContent = user ? <UserPanel /> : <AuthTabs />

  return (
    <Modal
      // компонент, взаимодействие с которым приводит к открытию модального окна
      triggerComponent={
        <ListItemButton sx={{ borderRadius: '50%', px: theme.spacing(1) }}>
          <Avatar
            // источником аватара является либо файл, загруженный пользователей, либо дефолтное изображение
            src={user && user.avatarUrl ? user.avatarUrl : '/img/user.png'}
          />
        </ListItemButton>
      }
      modalContent={modalContent}
    />
  )
}
