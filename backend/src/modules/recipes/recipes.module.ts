import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { AuthModule } from '../auth/auth.module';
import { UploadthingModule } from '../uploadthing/uploadthing.module';

@Module({
  imports: [AuthModule, UploadthingModule],
  providers: [RecipesService],
  controllers: [RecipesController],
})
export class RecipesModule {}
