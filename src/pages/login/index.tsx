import { Button, Input, useToast } from '@chakra-ui/react';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import env from '@/environments/environments';

const Login = () => {
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const toast = useToast();

  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name')
    const alias = formData.get('alias')

    const response = await fetch(`${env.url}/join`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, alias })
    })


    if (response.ok) {
      const data = await response.json()
      const token = data.data._id;
      Cookies.set('sessionToken', token, {expires: 1})
      router.push('/messages')
    } else {
      toast({
        title: "Error",
        description: "Could not possible load your data.",
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  }

  return (
    <div className='flex items-center justify-center w-screen h-screen bg-bg-color'>
      <form className='flex p-6 h-auto w-[70vmin] bg-alt-color rounded-lg shadow-xl flex-col gap-4 pb-4' onSubmit={handleSubmit}>
        <div>
          <h5>Join</h5>
        </div>

        <div>
          <label htmlFor='inputName'>Insert a name</label>
          <Input 
            id='inputName'
            name='name'
            placeholder='john doe' 
            borderColor={'#d79921'} 
            color={'#ebdbb2'}
            onChange={(e) => {
              setCanSubmit(e.target.value.length > 0);
            }}
            required
            ></Input>
          {!canSubmit && <small className='text-red-500'>required!</small>}
        </div>
        
        <div>
          <label htmlFor='alias'>Insert a alias</label>
          <Input 
            id='alias'
            name='alias'
            placeholder='johnny' 
            borderColor={'#d79921'} 
            color={'#ebdbb2'}
            ></Input>
        </div>

        <div className='w-full pt-4'>  
          <Button 
            width={'full'}
            borderColor={'#665c54'}
            textColor={'#665c54'}
            borderWidth={'.1rem'}
            backgroundColor={'#212121'}
            _active={{
              bg: '#d79921',
              color: '#212121',
              border: 'none'
            }}
            _hover={{
              bg: '#665c54',
              color: '#212121'
            }}
            isActive={canSubmit}
            type='submit'>Start</Button>
        </div>
      </form>
    </div>
  )
}

export default Login