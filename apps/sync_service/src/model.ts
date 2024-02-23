export class CreateBooksDto {
  ID?: number | string;
  title: string;
  author_ID: number;
  stock: number;
}
