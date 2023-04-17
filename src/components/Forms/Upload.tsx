import { useUser } from '@/utils/swr'
import { Avatar, Box, Button, Typography } from '@mui/material'
import { useRef, useState } from 'react'
import FormFieldsWrapper from './Wrapper'

type Props = {
    closeModal?: () => void
}

export default function UploadForm({ closeModal }: Props) {
// ссылка на элемент для превью загруженного файла
  const previewRef = useRef<HTMLImageElement | null>(null);

  // состояние файла
  const [file, setFile] = useState<File>();
  const { user, accessToken, mutate } = useUser();

  if(!user) return null;

  if (!user) return null

  // обработчик отправки формы
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    if (!file) return

    e.preventDefault()

    const formData = new FormData()

    // создаем экземпляр `File`, названием которого является id пользователя + расширение файла
    const _file = new File([file], `${user.id}.${file.type.split('/')[1]}`, {
      type: file.type
    })
    formData.append('avatar', _file)

    try {
      // отправляем файл на сервер
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          // роут для загрузки аватара является защищенным
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (!res.ok) {
        throw res
      }

      // извлекаем обновленные данные пользователя
      const user = await res.json()
      // инвалидируем кэш
      mutate({ user })

      // закрываем модалку
      if (closeModal) {
        closeModal()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // обработчик изменения состояния инпута для загрузки файла
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files && previewRef.current) {
      // извлекаем файл
      const _file = e.target.files[0]
      // обновляем состояние
      setFile(_file)
      // получаем ссылку на элемент `img`
      const img = previewRef.current.children[0] as HTMLImageElement
      // формируем и устанавливаем источник изображения
      img.src = URL.createObjectURL(_file)
      img.onload = () => {
        // очищаем память
        URL.revokeObjectURL(img.src)
      }
    }
  }

  return (
    <FormFieldsWrapper handleSubmit={handleSubmit}>
      <Typography variant='h4'>Avatar</Typography>
      <Box display='flex' alignItems='center' gap={2}>
        <input
          accept='image/*'
          style={{ display: 'none' }}
          id='avatar'
          name='avatar'
          type='file'
          onChange={handleChange}
        />
        <label htmlFor='avatar'>
          <Button component='span'>Choose file</Button>
        </label>
        <Avatar alt='preview' ref={previewRef} src='/img/user.png' />
        <Button
          type='submit'
          variant='contained'
          color='success'
          disabled={!file}
        >
          Upload
        </Button>
      </Box>
    </FormFieldsWrapper>
  )
}
