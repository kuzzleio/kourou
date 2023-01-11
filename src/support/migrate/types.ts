export type IndexSpecification = {
  name: string;
  aliases: { [key: string]: any };
  mappings: any;
  settings: any;
};