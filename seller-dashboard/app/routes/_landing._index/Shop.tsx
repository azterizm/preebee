import { Link } from "@remix-run/react";

export default function Shop(props: {
  logoFileName: boolean;
  id: string;
  title: string;
  color: string;
  name: string;
}) {
  return (
    <Link style={{ borderColor: props.color }} to={`https://${props.name}.preebee.com`} key={props.id} target='_blank' className='border-2 rounded-full h-36 w-36 min-h-36 min-w-36 flex items-center justify-center flex-col gap-4 hover:bg-base-200 snap-center'>
      <div>
        {props.logoFileName ? (
          <img src={`/api/logo/${props.id}`} alt={`${props.title}'s shop`} className='w-8 aspect-square object-contain' />
        ) : (
          <p className='text-xl font-bold'>{props.title[0].toUpperCase()}</p>
        )}
      </div>
      <p className='text-center w-full text-xs truncate'>{props.title}</p>
    </Link>
  )
}
