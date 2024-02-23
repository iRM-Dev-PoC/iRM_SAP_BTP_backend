import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cds from '@sap/cds';
import { Client } from 'pg';
import { CreateBooksDto } from './model';

@Injectable()
export class SyncServiceService {
  config = new ConfigService();
  password: string = '1234';
  // postgresConfig = {
  //   user: 'postgres',
  //   password: this.password,
  //   database: 'postgres',
  //   host: '0.0.0.0',
  //   port: '5432',
  // };
  postgresConfig = {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
  };

  private client: Client;
  constructor() {
    this.client = new Client(this.postgresConfig);
  }

  getHello(): string {
    return 'Hello World!';
  }

  async getStudents() {
    return await cds.run(SELECT.from('my.bookshop.Books'));
    // return await cds.run(SELECT.from('public.tbl_student'));
  }

  async findAll() {
    try {
      await this.client.connect();
      // console.log(this.client);
      const client = this.client;
      // console.log(client);
      const result = await client.query('select * from public.tbl_student');
      console.log(result);

      return result.rows;
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      // console.log(this.client);
      this.client.end();
    }
  }

  async getall() {
    return await cds.run(SELECT.from('my.bookshop.Books'));
  }

  async getBooks() {
    const books = await cds.run(SELECT.from('my.bookshop.Books'));
    return books;
  }

  async getBookById(id: number) {
    console.log(id);
    const book = await cds.run(
      SELECT.from('my.bookshop.Books').where({ ID: id }),
    );

    // console.log(book);
    return book;
  }

  async createBook(newbook: CreateBooksDto) {
    let tx = cds.transaction();

    try {
      const existingbook = await tx.run(
        SELECT.one.from('my.bookshop.Books').where({ ID: newbook.ID }),
      );
      if (existingbook) {
        // console.log(existingbook);
        await tx.commit();
        return {
          message: `Book already exists with this ID ${existingbook.ID}. Please try again.`,
        };
      } else {
        const book = await tx.run(INSERT.into('my.bookshop.Books', newbook));
        await tx.commit();
        return { message: 'Book created successfully', NewBook: newbook };
      }
    } catch (error) {
      await tx.rollback();
      return {
        message: 'Book not created something went wrong. Please try again.',
        ermsg: error.message,
      };
    }
  }

  async updateBook(id: number, newbook: CreateBooksDto) {
    const book = await cds.run(UPDATE('my.bookshop.Books', id).with(newbook));
    return book;
  }

  async deleteBook(id: number) {
    console.log(id);
    const book = await cds.run(
      DELETE.from('my.bookshop.Books').where({ ID: id }),
    );
    return book;
  }

  async getAuthors() {
    const authors = await cds.run(SELECT.from('my.bookshop.Authors'));
    return authors;
  }
  async getOrders() {
    const orders = await cds.run(SELECT.from('my.bookshop.Orders'));
    return orders;
  }

  async uploadCSV(filename: string) {
    
  }
}
