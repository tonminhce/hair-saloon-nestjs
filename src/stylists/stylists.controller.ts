import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { StylistsService } from './stylists.service';
import { CreateStylistDto } from './dto/create-stylist.dto';
import { UpdateStylistDto } from './dto/update-stylist.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Stylists')
@Controller('stylists')
export class StylistsController {
  constructor(private readonly stylistsService: StylistsService) {}

  @Post()
  @ApiBody({ type: CreateStylistDto })
  @ApiQuery({
    name: 'includeStoreName',
    required: false,
    type: Boolean,
    description: 'Include store name in response',
    schema: { default: true },
  })
  async create(
    @Body() createStylistDto: CreateStylistDto,
    @Query('includeStoreName') includeStoreName?: string,
  ) {
    const includeName = includeStoreName !== 'false';
    return await this.stylistsService.create(createStylistDto, includeName);
  }

  @Get()
  @ApiQuery({
    name: 'includeStoreName',
    required: false,
    type: Boolean,
    description: 'Include store name in response',
    schema: { default: true },
  })
  async findAll(@Query('includeStoreName') includeStoreName?: string) {
    const includeName = includeStoreName !== 'false';
    return await this.stylistsService.findAll(includeName);
  }

  @Get(':id')
  @ApiQuery({
    name: 'includeStoreName',
    required: false,
    type: Boolean,
    description: 'Include store name in response',
    schema: { default: true },
  })
  async findOne(
    @Param('id') id: string,
    @Query('includeStoreName') includeStoreName?: string,
  ) {
    const includeName = includeStoreName !== 'false';
    return await this.stylistsService.findOne(+id, includeName, undefined);
  }

  @ApiParam({
    name: 'name_like',
    required: true,
    description: 'search stylist whose name contains %NAME_LIKE%',
  })
  @ApiOperation({
    summary: 'Search stylist by name',
  })
  @Get('search/:name_like')
  async search(@Param('name_like') name_like: string) {
    return await this.stylistsService.search(name_like);
  }

  @Put(':id')
  @ApiQuery({
    name: 'includeStoreName',
    required: false,
    type: Boolean,
    description: 'Include store name in response',
    schema: { default: true },
  })
  async update(
    @Param('id') id: string,
    @Body() updateStylistDto: UpdateStylistDto,
    @Query('includeStoreName') includeStoreName?: string,
  ) {
    const includeName = includeStoreName !== 'false';
    return await this.stylistsService.update(
      +id,
      updateStylistDto,
      includeName,
    );
  }

  @Delete(':id')
  async trash(@Param('id') id: string) {
    return await this.stylistsService.trash(+id);
  }
}
