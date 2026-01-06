import { $Enums } from '@prisma/client';

export interface IDataLoader {
   name: string;
   type: $Enums.AchievementDepDataType;
   description: string | null;
   isList: boolean;
}

const generateFieldString = (props: IDataLoader) => {
   const typeStr = (() => {
      switch (props.type) {
         case 'BOOLEAN':
            return 'boolean';
         case 'NUMERIC':
            return 'number';
         default:
            return 'string';
      }
   })();
   const suffix = props.isList ? '[]' : '';
   return `\n/** ${props.description} */\n${props.name}: ${typeStr}${suffix};\n`;
};

export const convertToDts = (dataLoaders: IDataLoader[]) => {
   const propsInterface = `interface AchievementCheckProps {${dataLoaders
      .map(generateFieldString)
      .join('')}}\n`;

   const funcInterface = `type CheckFunc = (props: AchievementCheckProps) => {achieved:boolean;progress:number;};\n`;

   return `declare function defineCheckFunc(func: CheckFunc): CheckFunc;\n\n${propsInterface}${funcInterface}`;
};
