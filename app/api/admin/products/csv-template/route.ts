import { NextResponse } from "next/server";

const TEMPLATE = `name,slug,category,type,basePrice,salePrice,sku,stock,description,shortDescription,tags,isActive,isFeatured,isBestSeller,images,variantAttributes,variantValues,variantPrice,variantSalePrice,variantSku,variantStock
Wireless Speaker,wireless-speaker,Electronics,simple,3500,2999,SPK-001,25,Portable wireless speaker with deep bass,Portable speaker with deep bass,"speaker,bluetooth,audio",true,true,false,https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600,,,,,,
Steel Water Bottle,steel-water-bottle,Sports & Outdoors,simple,1200,,BTL-001,50,Double-wall vacuum insulated bottle,Insulated bottle,"bottle,sports",true,false,true,,,,,,,
Cotton T-Shirt,cotton-tshirt-import,Clothing,variable,999,,,,"Premium 100% cotton t-shirt",Premium cotton t-shirt,"tshirt,cotton",true,true,false,,Size:Color,M:Black,999,,TSH-M-BLK,15
,,,,,,,,,,,,,,,Size:Color,L:Black,999,,TSH-L-BLK,12
,,,,,,,,,,,,,,,Size:Color,M:White,999,,TSH-M-WHT,10
,,,,,,,,,,,,,,,Size:Color,L:White,1099,,TSH-L-WHT,8`;

export async function GET() {
  return new NextResponse(TEMPLATE, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="product-import-template.csv"',
    },
  });
}
