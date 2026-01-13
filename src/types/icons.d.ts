declare module "~icons/*" {
  import type { ComponentType, SVGProps } from "react"
  const component: ComponentType<SVGProps<SVGSVGElement>>
  export default component
}

declare module "virtual:icons/*" {
  import type { ComponentType, SVGProps } from "react"
  const component: ComponentType<SVGProps<SVGSVGElement>>
  export default component
}
