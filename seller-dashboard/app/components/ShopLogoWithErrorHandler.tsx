import _ from "lodash";
import { HTMLAttributes } from "react";

export default function ShopLogoWithErrorHandler(props: { id: string, title: string } & HTMLAttributes<HTMLImageElement>) {
  return (
    <img src={'/api/logo/' + props.id} alt={`${props.title}'s shop`} onError={() => console.log("IMAGE ERROR")} {..._.omit(props, ['id', 'title'])} />
  )
}
