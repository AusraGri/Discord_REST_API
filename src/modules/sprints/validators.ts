import { sprintSchema } from "./schema"

export const parseSprintCode = (message: unknown) =>
    sprintSchema.omit({ fullTitle: true }).parse(message)


// const sprintValidate = () => {
//     const parseSprint = (message: unknown) =>
//         sprintSchema.parse(message)
    
//       const parseSprintCode = (message: unknown) =>
//         sprintSchema.omit({ fullTitle: true }).parse(message)
    
//       const parseSprintTitle = (message: unknown) =>
//         sprintSchema.omit({ sprintCode: true }).parse(message)
    
//       return {parseSprint}
// }