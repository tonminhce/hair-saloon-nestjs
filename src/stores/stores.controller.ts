import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  ParseArrayPipe,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @ApiBody({ type: CreateStoreDto })
  async create(@Body() createStoreDto: CreateStoreDto) {
    return await this.storesService.create(createStoreDto);
  }

  @Get()
  @ApiQuery({
    name: 'perPage',
    required: false,
    description:
      'Number of store to fetch.\n\n' +
      'If `perPage` > 0, it fetches forward. If `perPage` < 0 it fetches backwards\n\n',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description:
      'store_id. Result will start from the nearest store with id > `cursor` or < `cursor` based on `perPage`\n\n' +
      'Result not include the cursor. If `cursor` undefined, it fetches from start of the table (include first row)',
  })
  @ApiQuery({
    name: 'all',
    required: false,
    description:
      'Get all stores. This params override any other params when set to True (default: true)',
  })
  @ApiQuery({
    name: 'idAndNameAndSeatCountOnly',
    required: false,
    type: Boolean,
    description: 'If true, returns only store IDs, names and seat counts',
  })
  async findWithPagination(
    @Query('perPage') take?: number,
    @Query('cursor') cursor?: number,
    @Query('all') all: boolean = true,
    @Query('idAndNameAndSeatCountOnly') idAndNameAndSeatCountOnly?: boolean,
  ) {
    if (all) return await this.storesService.findAll(idAndNameAndSeatCountOnly);

    take = take ?? 5;
    cursor = cursor ?? 0;
    const res = await this.storesService.findWithPagination(
      +take,
      +cursor,
      idAndNameAndSeatCountOnly,
    );

    return res.length
      ? {
          data: res,
          next_cursor: res[res.length - 1].id,
          prev_cursor: res[0].id,
        }
      : {
          data: [],
          next_cursor: null,
          prev_cursor: null,
        };
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'Store ID',
    required: true,
  })
  @ApiQuery({
    name: 'idAndNameAndSeatCountOnly',
    required: false,
    type: Boolean,
    description: 'If true, returns only store ID, name and seat count',
  })
  async findOne(
    @Param('id') id: string,
    @Query('idAndNameAndSeatCountOnly') idAndNameAndSeatCountOnly?: boolean,
  ) {
    return await this.storesService.findOne(+id, idAndNameAndSeatCountOnly);
  }

  @Put('restore')
  @ApiQuery({
    name: 'ids',
    type: Number,
    required: true,
    description:
      'restore soft deleted records. Input could be single id or list of ids (comma separated)',
    schema: {
      oneOf: [{ type: 'number' }, { type: 'array', items: { type: 'number' } }],
    },
  })
  async restore(
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
  ) {
    return await this.storesService.restore(ids);
  }

  @Put(':id')
  @ApiBody({ type: UpdateStoreDto })
  async update(
    @Param('id') id: number,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    return await this.storesService.update(+id, updateStoreDto);
  }

  @Delete()
  @ApiQuery({
    name: 'ids',
    type: Number,
    required: true,
    description:
      'Soft delete many records: Input is list of ids (comma separated)',
    schema: {
      oneOf: [{ type: 'number' }, { type: 'array', items: { type: 'number' } }],
    },
  })
  async trashMany(
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
  ) {
    return await this.storesService.trashMany(ids);
  }

  @Delete(':id')
  async trash(@Param('id') id: number) {
    return await this.storesService.trash(+id);
  }

  @ApiParam({
    name: 'store_id',
    description: 'store ID',
    example: 3,
    required: true,
  })
  @ApiOperation({
    summary:
      'Get the next queue ID of by store_id. This should be used when FE loses track of the next queue ID (on reboot or refresh)',
  })
  @ApiResponse({
    status: 200,
    description: 'The next queue ID. Nullable if the store does not exist',
  })
  @Get(':store_id/next_queue_id')
  async getNextQueueId(@Param('store_id') store_id: string) {
    return await this.storesService.get_next_queue_id(+store_id);
  }

  @Get(':store_id/stylist-count')
  @ApiOperation({
    summary: 'Get total number of stylists in a store',
  })
  @ApiParam({
    name: 'store_id',
    description: 'Store ID',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the total number of stylists in the store',
  })
  async getStylistCount(@Param('store_id') store_id: string) {
    return await this.storesService.getTotalStylistCount(+store_id);
  }

  @Get(':store_id/active-stylist-count')
  @ApiOperation({
    summary: 'Get total number of active stylists in a store',
  })
  @ApiParam({
    name: 'store_id',
    description: 'Store ID',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the total number of active stylists in the store',
  })
  async getActiveStylistCount(@Param('store_id') store_id: string) {
    return await this.storesService.getTotalActiveStylistCount(+store_id);
  }
}
