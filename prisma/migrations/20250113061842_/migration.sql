-- CreateEnum
CREATE TYPE "CustomerCategory" AS ENUM ('man', 'woman', 'boy', 'girl', 'NONE');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('calling', 'waiting', 'standing', 'expired', 'served');

-- CreateEnum
CREATE TYPE "AgeGroup" AS ENUM ('a0_10', 'a11_19', 'a20_29', 'a30_39', 'a40_49', 'a50');

-- CreateEnum
CREATE TYPE "TimeSlot" AS ENUM ('a0_1', 'a1_2', 'a2_3', 'a3_4', 'a4_5', 'a5_6', 'a6_7', 'a7_8', 'a8_9', 'a9_10', 'a10_11', 'a11_12', 'a12_13', 'a13_14', 'a14_15', 'a15_16', 'a16_17', 'a17_18', 'a18_19', 'a19_20', 'a20_21', 'a21_22', 'a22_23', 'a23_24');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

-- CreateEnum
CREATE TYPE "StoreType" AS ENUM ('STREET_STORE', 'SHOPPING_CENTER', 'STATION');

-- CreateEnum
CREATE TYPE "StylistStatus" AS ENUM ('Active', 'Inactive');

-- CreateEnum
CREATE TYPE "WorkType" AS ENUM ('FullTime', 'PartTime');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Other');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('check_in_out');

-- CreateEnum
CREATE TYPE "StylistRealTimeStatus" AS ENUM ('available', 'cutting', 'unavailable');

-- CreateEnum
CREATE TYPE "DataType" AS ENUM ('text', 'number', 'select', 'date', 'email', 'password', 'telephone', 'url');

-- CreateEnum
CREATE TYPE "AllowedModel" AS ENUM ('store', 'stylist');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('access_token', 'refresh_token');

-- CreateTable
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "customer_category" "CustomerCategory" NOT NULL,
    "first_call_time" TIMESTAMP(0),
    "status" "Status" NOT NULL DEFAULT 'waiting',
    "customer_phone" VARCHAR(13),
    "queue_id" SMALLINT NOT NULL,
    "store_id" SMALLINT NOT NULL,
    "stylist_id" SMALLINT,
    "age_group" "AgeGroup",
    "start_time" TIMESTAMP(0),
    "end_time" TIMESTAMP(0),
    "price" INTEGER NOT NULL,
    "is_first_time" BOOLEAN,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0),
    "deleted_at" TIMESTAMP(0),
    "waiting_time" REAL,
    "time_slot" "TimeSlot",
    "day_of_week" "DayOfWeek",
    "time_zone_date" DATE,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" SMALLSERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "address" VARCHAR(200),
    "businessHoursWeekdays" TEXT,
    "businessHoursWeekends" TEXT,
    "man_price" INTEGER NOT NULL,
    "woman_price" INTEGER NOT NULL,
    "boy_price" INTEGER NOT NULL,
    "girl_price" INTEGER NOT NULL,
    "next_queue_id" SMALLINT NOT NULL DEFAULT 1,
    "seat_count" SMALLINT NOT NULL,
    "store_type" "StoreType" NOT NULL,
    "store_type_text" VARCHAR(50),
    "area" DECIMAL(5,2) NOT NULL,
    "opened_date" DATE,
    "person_in_charge1" VARCHAR(50),
    "person_in_charge2" VARCHAR(50),
    "notes" VARCHAR(200),
    "image_uuid" UUID,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0),
    "deleted_at" TIMESTAMP(0),
    "custom_data" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stylist" (
    "id" SMALLSERIAL NOT NULL,
    "status" "StylistStatus" NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "gender" "Gender",
    "phone_number" VARCHAR(13) NOT NULL,
    "email" VARCHAR(100),
    "date_of_birth" DATE,
    "date_hired" DATE,
    "position" VARCHAR(50),
    "work_type" "WorkType",
    "living_area" VARCHAR(200),
    "registered_store_id" SMALLINT NOT NULL,
    "notes" VARCHAR(200),
    "image_uuid" UUID,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0),
    "deleted_at" TIMESTAMP(0),
    "custom_data" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Stylist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StylistStore" (
    "stylist_id" SMALLINT NOT NULL,
    "working_store_id" SMALLINT NOT NULL,
    "seat_number" SMALLINT,
    "real_time_status" "StylistRealTimeStatus" NOT NULL DEFAULT 'unavailable',
    "current_cutting_ticket_id" SMALLINT,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0),
    "deleted_at" TIMESTAMP(0),

    CONSTRAINT "StylistStore_pkey" PRIMARY KEY ("stylist_id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "phone" VARCHAR(13) NOT NULL,
    "name" VARCHAR(255),
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0),
    "deleted_at" TIMESTAMP(0),

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("phone")
);

-- CreateTable
CREATE TABLE "CustomerStore" (
    "customer_phone" TEXT NOT NULL,
    "store_id" SMALLINT NOT NULL,
    "visit_count" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0),
    "deleted_at" TIMESTAMP(0),

    CONSTRAINT "CustomerStore_pkey" PRIMARY KEY ("customer_phone","store_id")
);

-- CreateTable
CREATE TABLE "Action" (
    "id" SERIAL NOT NULL,
    "stylist_id" SMALLINT NOT NULL,
    "store_id" SMALLINT NOT NULL,
    "type" "ActionType" NOT NULL,
    "checkin_time" TIMESTAMP(0),
    "checkout_time" TIMESTAMP(0),
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0),
    "deleted_at" TIMESTAMP(0),
    "time_zone_date" DATE,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "store_id" SMALLINT NOT NULL,
    "stylist_id" SMALLINT NOT NULL,
    "stylist_name" TEXT NOT NULL,
    "store_name" TEXT NOT NULL,
    "customer_category" "CustomerCategory",
    "number_haircuts" SMALLINT NOT NULL DEFAULT 0,
    "revenue" REAL NOT NULL DEFAULT 0,
    "total_hours" REAL NOT NULL DEFAULT 0,
    "cutting_hours" REAL NOT NULL DEFAULT 0,
    "operation_rate" REAL NOT NULL DEFAULT 0,
    "avg_cut_time" REAL NOT NULL DEFAULT 10,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0),
    "deleted_at" TIMESTAMP(0),

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Survey" (
    "id" SERIAL NOT NULL,
    "store_id" SMALLINT,
    "form_link" VARCHAR(2048) NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0),
    "deleted_at" TIMESTAMP(0),

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meta" (
    "table_name" "AllowedModel" NOT NULL,
    "accessorKey" TEXT NOT NULL,
    "header" TEXT NOT NULL,
    "type" "DataType" NOT NULL,
    "editSelectOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "deleted_at" TIMESTAMP(0),

    CONSTRAINT "Meta_pkey" PRIMARY KEY ("table_name","accessorKey")
);

-- CreateTable
CREATE TABLE "Token" (
    "type" "TokenType" NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("type")
);

-- CreateIndex
CREATE INDEX "Ticket_created_at_store_id_status_idx" ON "Ticket"("created_at", "store_id", "status");

-- CreateIndex
CREATE INDEX "Ticket_stylist_id_idx" ON "Ticket"("stylist_id");

-- CreateIndex
CREATE INDEX "Ticket_customer_category_idx" ON "Ticket"("customer_category");

-- CreateIndex
CREATE INDEX "Ticket_time_zone_date_idx" ON "Ticket"("time_zone_date");

-- CreateIndex
CREATE INDEX "Stylist_registered_store_id_status_idx" ON "Stylist"("registered_store_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "StylistStore_working_store_id_seat_number_key" ON "StylistStore"("working_store_id", "seat_number");

-- CreateIndex
CREATE UNIQUE INDEX "StylistStore_working_store_id_stylist_id_key" ON "StylistStore"("working_store_id", "stylist_id");

-- CreateIndex
CREATE INDEX "Action_created_at_idx" ON "Action"("created_at");

-- CreateIndex
CREATE INDEX "Action_store_id_checkout_time_idx" ON "Action"("store_id", "checkout_time");

-- CreateIndex
CREATE INDEX "Action_time_zone_date_idx" ON "Action"("time_zone_date");

-- CreateIndex
CREATE UNIQUE INDEX "Report_date_store_id_stylist_id_customer_category_key" ON "Report"("date", "store_id", "stylist_id", "customer_category");

-- CreateIndex
CREATE INDEX "Meta_table_name_idx" ON "Meta"("table_name");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_stylist_id_fkey" FOREIGN KEY ("stylist_id") REFERENCES "Stylist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stylist" ADD CONSTRAINT "Stylist_registered_store_id_fkey" FOREIGN KEY ("registered_store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StylistStore" ADD CONSTRAINT "StylistStore_working_store_id_fkey" FOREIGN KEY ("working_store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StylistStore" ADD CONSTRAINT "StylistStore_stylist_id_fkey" FOREIGN KEY ("stylist_id") REFERENCES "Stylist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerStore" ADD CONSTRAINT "CustomerStore_customer_phone_fkey" FOREIGN KEY ("customer_phone") REFERENCES "Customer"("phone") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerStore" ADD CONSTRAINT "CustomerStore_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Survey" ADD CONSTRAINT "Survey_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
