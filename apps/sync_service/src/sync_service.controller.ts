import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SyncServiceService } from './sync_service.service';
import { CreateBooksDto } from './model';

@Controller()
export class SyncServiceController {
  constructor(private readonly syncServiceService: SyncServiceService) {}

  @Get()
  getHello(): string {
    return this.syncServiceService.getHello();
  }

  @Get('students')
  async getStudents() {
    return await this.syncServiceService.getStudents();
  }

  @Get('studentsdb')
  async findAll() {
    return await this.syncServiceService.findAll();
  }

  @Get('books')
  async getBooks() {
    // console.log(cds.entities);
    return await this.syncServiceService.getBooks();
  }
  @Get('book/:id')
  async getBookById(@Param('id') id: number) {
    return await this.syncServiceService.getBookById(id);
  }

  @Post('createbook')
  async createBook(@Body() createBooksDto: CreateBooksDto) {
    return await this.syncServiceService.createBook(createBooksDto);
  }
  @Post('updatebook')
  async updateBook(@Body() createBooksDto: CreateBooksDto) {
    const id = Number(createBooksDto.ID);
    return await this.syncServiceService.updateBook(id, createBooksDto);
  }

  @Post('deletebook/:id')
  async deleteBook(@Param('id') id: number) {
    return await this.syncServiceService.deleteBook(id);
  }

  @Get('authors')
  async getAuthors() {
    return await this.syncServiceService.getAuthors();
  }

  @Get('orders')
  async getOrders() {
    return await this.syncServiceService.getOrders();
  }
}
