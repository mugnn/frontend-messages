import { GetServerSideProps } from "next"
import { FormEvent, useEffect, useState } from "react";
import Pusher from 'pusher-js';
import Cookies from 'cookies'
import env from "@/environments/environments";
import { Avatar, Button, Input, Tag, Tooltip, useToast } from '@chakra-ui/react';
import './styles.css';

interface Document {
  _id: string,
  content: string,
  time: string,
  user: UserData,
}

interface UserData {
  _id: string,
  name: string,
  alias: string,
  icon_color: string,
}

const fetchUserResponse = async (token: string): Promise<Response> => {
  return await fetch(`${env.url}/user/data?token=${token}`, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json"
    },
  });
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const req = context.req;
  const res = context.res;
  const redirect = {
    redirect: {
      destination: '/login',
      permanent: false
    }
  }

  const cookies = new Cookies(req, res);
  const token = cookies.get('sessionToken');
  if (!token) {
    return redirect
  }

  const userResponse = await fetchUserResponse(token);
  if (!userResponse.ok) {
    return redirect;
  }

  return {
    props: {
      token
    },
  };
}

const Messages = ({ token }: { token: string }) => {
  const [data, setData] = useState<Document[]>([]);
  const [message, setMessage] = useState<string>("");
  const [userData, setUserData] = useState<UserData>({
    _id: "",
    name: "",
    alias: "",
    icon_color: "",
  });
  const toast = useToast();

  const formatISODate = (isoString: string) => {
    const date = new Date(isoString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `   ${day}/${month}/${year} às ${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const userResponse = await fetchUserResponse(token);
        const userResponseData: UserData = await userResponse.json();
        setUserData(userResponseData);


        const response = await fetch(`${env.url}/load/messages`, {
          method: 'GET',
          headers: {
            "Content-Type": "application/json"
          },
        })
    
        const messages: Document[] = await response.json();
        setData(messages);

        const pusher = new Pusher('353e80ec7ad4635651aa', {
          cluster: 'sa1',
        });
    
        const channel = pusher.subscribe('messages-channel');
    
        channel.bind('inserted', (doc: Document[]) => {
          setData(doc)
        })

      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "Could not possible load your data.",
          status: 'error',
          duration: 5000,
          isClosable: true
        })
      }
    }
    loadMessages();
  }, [])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const content = message;
    const user_id = token;

    await fetch(`${env.url}/send/all`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content, user_id })
    });

    // clear message after submit
    setMessage('');
  }

  return(
    <div className="flex w-screen h-screen justify-center items-end py-10 bg-bg-color">
      <div className="flex flex-col w-3/4 gap-4 h-full">
        <div className="flex overflow-auto h-full pr-3">
          <ul className="flex w-full flex-col gap-4">
            {data.map((item) => {
              if (item["user"]["_id"] === token) {
                return (
                  <div className="flex w-full flex-row justify-end gap-3" key={item["_id"]}>
                    <div className="flex flex-col text-right items-end gap-2">
                      <h6 className="text-main-color">{ item["user"]["name"] } (você)</h6>
                      <p>{ item["content"] }</p>
                      <Tag 
                        size={'sm'} 
                        backgroundColor={'#212121'} 
                        fontStyle={'italic'} 
                        color={'#d79921'} 
                        height={'1.2rem'} 
                        width={'fit-content'}>{formatISODate(item["time"])}</Tag>
                    </div>
                    <Tooltip label={`${item["user"]["name"]} (${item["user"]["alias"]})`}>
                      <Avatar backgroundColor={item["user"]["icon_color"]} />
                    </Tooltip>
                  </div>
                )
              } else {
                return (
                  <div className="flex w-full flex-row justify-start gap-3" key={item["_id"]}>
                    <Tooltip label={`${item["user"]["name"]} (${item["user"]["alias"]})`}>
                      <Avatar backgroundColor={item["user"]["icon_color"]} />
                    </Tooltip>
                    <div className="flex flex-col align-center gap-1">
                      <h6 className="text-main-color">{ item["user"]["name"] }</h6>
                      <p>{ item["content"] }</p>
                      <Tag 
                        size={'sm'} 
                        backgroundColor={'#212121'} 
                        fontStyle={'italic'} 
                        color={'#d79921'} 
                        height={'1.2rem'} 
                        width={'fit-content'}>{formatISODate(item["time"])}</Tag>
                    </div>
                  </div>
                )
              }
            })}
          </ul>
        </div>
        <form className="flex flex-row gap-2 items-center" onSubmit={handleSubmit}>  
          <Input 
            name='message'
            placeholder='send a message' 
            borderColor={'#d79921'} 
            color={'#ebdbb2'}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value)
            }}
            required
          ></Input>
          <Button
            borderColor={'#665c54'}
            textColor={'#665c54'}
            borderWidth={'.1rem'}
            backgroundColor={'#212121'}
            _active={{
              bg: '#d79921',
              color: '#212121',
              border: 'none',
              _hover: {
                bg: '#fabd2f'
              }
            }}
            _hover={{
              bg: '#665c54',
              color: '#212121'
            }}
            isActive={ message.length > 0 }
            type='submit'>Send</Button>
            <Tooltip label={userData.name}>
              <Avatar backgroundColor={userData.icon_color} />
            </Tooltip>
        </form>
      </div>
    </div>
  )
}



export default Messages