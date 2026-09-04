import svgPaths from "./svg-42z7x5ejzm";
import imgLogoChoXeDap from "figma:asset/b8ca1e4dcd8797724324eb300633c15375c3fe5c.png";
import imgCyclist from "figma:asset/11e51ea09636be86ff19757ecd6df6a099ecaa6d.png";
import imgImage1 from "figma:asset/c8691bf69b54f461c908563cbc1de85d78a4b623.png";
import imgFavorite from "figma:asset/d44ee4f7c67e8005c7aedad495f2d819d86be9cd.png";
import imgImage2 from "figma:asset/634be3a394d585878b45ee794cca6955a42679c5.png";
import imgIconMap from "figma:asset/8800c660f23853a36e062a5cba9055fb442305df.png";
import imgIconCalendar from "figma:asset/c8aabdc53c43e4920938ab1d5b577a5f7bd043e2.png";
import imgImage3 from "figma:asset/1ed126f879f1d1efab8f4ec2211ac75514d965d5.png";
import imgImage4 from "figma:asset/320e53e43dc134e2b6492653f4f57a42bb5c8ab0.png";
import imgVerifiedAccount from "figma:asset/68efd1c938c7029b9195ebba05e121ae8aa24ac2.png";
import imgImage5 from "figma:asset/ab32ea40e0bb1bca7a12384a385f479263570203.png";
import imgImage6 from "figma:asset/07aea499a43a00a4796daa109ac5f1cc51ab7926.png";
import imgImage7 from "figma:asset/2a7c45de544e5aca4478ddffa171d2d160b2fd03.png";
import imgImage8 from "figma:asset/c9daa4804c8134a1fd28006199218ae030046762.png";
import imgImage9 from "figma:asset/609e0c385a685ec4aeef898a08ba272ffa9b6008.png";
import imgImage10 from "figma:asset/7d7126a88d8234a67c6a507d22f99f7d2d9f9e61.png";
import imgImage11 from "figma:asset/b6452b7525cfd18641b93cfe09b71a5096d30592.png";
import imgRectangle32 from "figma:asset/9598d90d2e372895ebcfa169659cf75959678482.png";
import imgAnhavatarvuong2 from "figma:asset/2b47a1371057d88feb678913e455d9a9d24653a9.png";

function Nav() {
  return (
    <nav className="backdrop-blur-[35px] content-stretch flex h-[62px] items-center justify-center px-[40px] py-[16px] relative rounded-[40px] shrink-0 w-[153px]" data-name="Nav">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-black text-center tracking-[-0.12px] whitespace-nowrap">
        <p className="leading-[1.45]">Mua xe</p>
      </div>
    </nav>
  );
}

function Nav1() {
  return (
    <nav className="backdrop-blur-[35px] content-stretch flex h-[63px] items-center justify-center px-[40px] py-[16px] relative rounded-[40px] shrink-0 w-[149px]" data-name="Nav">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-black text-center tracking-[-0.12px] whitespace-nowrap">
        <p className="leading-[1.45]">Bán xe</p>
      </div>
    </nav>
  );
}

function Nav2() {
  return (
    <nav className="backdrop-blur-[35px] content-stretch flex h-[63px] items-center justify-center px-[40px] py-[16px] relative rounded-[40px] shrink-0 w-[149px]" data-name="Nav">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-black text-center tracking-[-0.12px] whitespace-nowrap">
        <p className="leading-[1.45]">Tin tức</p>
      </div>
    </nav>
  );
}

function Frame14() {
  return (
    <div className="content-stretch flex gap-[205px] items-center relative shrink-0">
      <Nav />
      <Nav1 />
      <Nav2 />
    </div>
  );
}

function Nav3({ className }: { className?: string }) {
  return (
    <nav className={className || "backdrop-blur-[35px] bg-[#2e9147] content-stretch flex items-center justify-center overflow-clip px-[10px] py-[14px] relative rounded-[20px] shrink-0"} data-name="Nav">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-center text-white tracking-[-0.12px] whitespace-nowrap">
        <p className="leading-[1.45]">Đăng ký / Đăng nhập</p>
      </div>
    </nav>
  );
}

function Header() {
  return (
    <div className="bg-white content-stretch flex items-center justify-between pl-[20px] pr-[40px] py-[10px] relative shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] shrink-0 w-[1728px]" data-name="Header">
      <div className="h-[94.702px] relative shrink-0 w-[103.036px]" data-name="logo ChoXeDap">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgLogoChoXeDap} />
      </div>
      <Frame14 />
      <Nav3 />
    </div>
  );
}

function Group14() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <div className="bg-[#2e9147] col-1 h-[58.645px] ml-0 mt-0 rounded-[30px] row-1 w-[209.017px]" />
      <div className="-translate-x-1/2 -translate-y-1/2 col-1 flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center ml-[104.8px] mt-[29.32px] not-italic relative row-1 text-[24px] text-center text-white tracking-[-0.12px] whitespace-nowrap">
        <p className="leading-[1.45]">Tìm kiếm</p>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="bg-white content-stretch flex gap-[98px] h-[85.712px] items-center px-[19px] py-[6px] relative rounded-[30px] shrink-0 w-[1423.6px]">
      <div className="h-[73.658px] relative shrink-0 w-[77.343px]" data-name="Cyclist">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgCyclist} />
      </div>
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[59.239px] justify-center leading-[0] not-italic relative shrink-0 text-[#868686] text-[24px] tracking-[-0.12px] w-[895.638px]">
        <p className="leading-[1.45] whitespace-pre-wrap">Tôi muốn mua xe đạp ...</p>
      </div>
      <Group14 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-center px-[21px] py-[12px] relative rounded-[100px] shrink-0 size-[64.346px]">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-black text-center whitespace-nowrap">
        <p className="leading-[1.45]">{`<`}</p>
      </div>
    </div>
  );
}

function Frame6() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-center px-[21px] py-[12px] relative rounded-[100px] shrink-0 size-[64.346px]">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-black text-center whitespace-nowrap">
        <p className="leading-[1.45]">{`>`}</p>
      </div>
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-[1678.044px]">
      <Frame8 />
      <Frame6 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="h-[42.374px] relative shrink-0 w-[179.861px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 179.861 42.374">
        <g id="Frame 56">
          <ellipse cx="21.9861" cy="21.187" fill="var(--fill-0, white)" id="Ellipse 3" rx="11.9861" ry="11.187" />
          <ellipse cx="55.9583" cy="21.187" fill="var(--fill-0, #D9D9D9)" id="Ellipse 4" opacity="0.8" rx="11.9861" ry="11.187" />
          <ellipse cx="89.9304" cy="21.187" fill="var(--fill-0, #D9D9D9)" id="Ellipse 5" opacity="0.8" rx="11.9861" ry="11.187" />
          <ellipse cx="123.903" cy="21.187" fill="var(--fill-0, #D9D9D9)" id="Ellipse 6" opacity="0.8" rx="11.9861" ry="11.187" />
          <ellipse cx="157.875" cy="21.187" fill="var(--fill-0, #D9D9D9)" id="Ellipse 7" opacity="0.8" rx="11.9861" ry="11.187" />
        </g>
      </svg>
    </div>
  );
}

function Components() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[218px] items-center ml-[28.3px] mt-[142.06px] relative row-1 w-[1678.044px]" data-name="Components">
      <Frame />
      <Frame7 />
      <Frame3 />
    </div>
  );
}

function Banner() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0" data-name="Banner">
      <div className="col-1 h-[801.187px] ml-0 mt-0 relative row-1 w-[1732.535px]" data-name="image 1">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <img alt="" className="absolute max-w-none object-cover size-full" src={imgImage1} />
          <div className="absolute bg-[rgba(0,0,0,0.28)] inset-0" />
        </div>
      </div>
      <Components />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[550.316px]">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center not-italic relative shrink-0 text-[38.4px] text-black tracking-[-0.192px]">
        <p className="leading-[1.45]">Xe đạp nổi bật</p>
      </div>
      <div className="flex flex-col font-['Inter:Italic',sans-serif] font-normal italic justify-center relative shrink-0 text-[#3d3d3d] text-[25.6px] tracking-[-0.128px]">
        <p className="leading-[1.45]">Những mẫu xe được yêu thích nhất</p>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 text-center w-[1438px] whitespace-nowrap">
      <Frame2 />
      <div className="flex flex-col font-['Inter:Italic',sans-serif] font-normal italic justify-center relative shrink-0 text-[#009a17] text-[25.6px] tracking-[-0.128px]">
        <p className="leading-[1.45]">{`Xem tất cả >`}</p>
      </div>
    </div>
  );
}

function Group6() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-[333.37px] mt-[206.29px] relative row-1">
      <div className="col-1 h-[37.714px] ml-0 mt-0 relative row-1 w-[39.933px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 39.9326 37.714">
          <ellipse cx="19.9663" cy="18.857" fill="var(--fill-0, #E9E9E9)" id="Ellipse 1" rx="19.9663" ry="18.857" />
        </svg>
      </div>
      <div className="col-1 ml-[9.85px] mt-[8.74px] relative row-1 size-[20.231px]" data-name="Favorite">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgFavorite} />
      </div>
    </div>
  );
}

function Group27() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-0 mt-0 relative row-1">
      <div className="col-1 h-[250.466px] ml-0 mt-0 relative rounded-[20px] row-1 w-[383.834px]" data-name="image 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[20px] size-full" src={imgImage2} />
      </div>
      <Group6 />
    </div>
  );
}

function Location() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-0 mt-0 relative row-1" data-name="Location">
      <p className="col-1 font-['Inter:Regular',sans-serif] font-normal h-[20.909px] leading-[normal] ml-[26.08px] mt-[1.73px] not-italic relative row-1 text-[16px] text-black w-[128.094px] whitespace-pre-wrap">TP. Hồ Chí Minh</p>
      <div className="col-1 ml-0 mt-0 relative row-1 size-[20.291px]" data-name="icon map">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgIconMap} />
      </div>
    </div>
  );
}

function Date() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-[173.46px] mt-[1.56px] relative row-1" data-name="Date">
      <p className="col-1 font-['Inter:Regular',sans-serif] font-normal h-[20.909px] leading-[normal] ml-[23.91px] mt-[0.18px] not-italic relative row-1 text-[16px] text-black w-[128.094px] whitespace-pre-wrap">2020</p>
      <div className="col-1 ml-0 mt-0 relative row-1 size-[17.18px]" data-name="icon calendar">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgIconCalendar} />
      </div>
    </div>
  );
}

function Group9() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <Location />
      <Date />
    </div>
  );
}

function Frame13() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[13px] items-start ml-[32.34px] mt-[263.55px] relative row-1 w-[327.997px]">
      <p className="font-['Inter:Bold',sans-serif] font-bold h-[27.879px] leading-[normal] not-italic relative shrink-0 text-[28px] text-black w-full whitespace-pre-wrap">Granavol SLE 7</p>
      <Group9 />
      <p className="font-['Inter:Extra_Bold',sans-serif] font-extrabold h-[33.687px] leading-[normal] not-italic relative shrink-0 text-[#46913d] text-[32px] w-full whitespace-pre-wrap">16.999.000 đ</p>
    </div>
  );
}

function Group() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] relative shrink-0">
      <div className="bg-[#fdfdfd] col-1 h-[413.965px] ml-[5.24px] mt-0 rounded-[20px] row-1 w-[378.597px]" />
      <Group27 />
      <Frame13 />
    </div>
  );
}

function Group7() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-[327.72px] mt-[206.29px] relative row-1">
      <div className="col-1 h-[37.714px] ml-0 mt-0 relative row-1 w-[39.933px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 39.9326 37.714">
          <ellipse cx="19.9663" cy="18.857" fill="var(--fill-0, #E9E9E9)" id="Ellipse 1" rx="19.9663" ry="18.857" />
        </svg>
      </div>
      <div className="col-1 ml-[9.85px] mt-[8.74px] relative row-1 size-[20.231px]" data-name="Favorite">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgFavorite} />
      </div>
    </div>
  );
}

function Group26() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-0 mt-0 relative row-1">
      <div className="col-1 h-[252.142px] ml-0 mt-0 relative rounded-[20px] row-1 w-[378.902px]" data-name="image 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[20px] size-full" src={imgImage3} />
      </div>
      <Group7 />
    </div>
  );
}

function Location1() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-0 mt-0 relative row-1" data-name="Location">
      <p className="col-1 font-['Inter:Regular',sans-serif] font-normal h-[20.909px] leading-[normal] ml-[26.08px] mt-[1.73px] not-italic relative row-1 text-[16px] text-black w-[128.094px] whitespace-pre-wrap">TP. Hồ Chí Minh</p>
      <div className="col-1 ml-0 mt-0 relative row-1 size-[20.291px]" data-name="icon map">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgIconMap} />
      </div>
    </div>
  );
}

function Date1() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-[173.46px] mt-[1.56px] relative row-1" data-name="Date">
      <p className="col-1 font-['Inter:Regular',sans-serif] font-normal h-[20.909px] leading-[normal] ml-[23.91px] mt-[0.18px] not-italic relative row-1 text-[16px] text-black w-[128.094px] whitespace-pre-wrap">2020</p>
      <div className="col-1 ml-0 mt-0 relative row-1 size-[17.18px]" data-name="icon calendar">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgIconCalendar} />
      </div>
    </div>
  );
}

function Group10() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <Location1 />
      <Date1 />
    </div>
  );
}

function Frame15() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[13px] items-start ml-[32.5px] mt-[265.55px] relative row-1 w-[327.997px]">
      <p className="font-['Inter:Bold',sans-serif] font-bold h-[27.879px] leading-[normal] not-italic relative shrink-0 text-[28px] text-black w-full whitespace-pre-wrap">Granavol SLE 7</p>
      <Group10 />
      <p className="font-['Inter:Extra_Bold',sans-serif] font-extrabold h-[33.687px] leading-[normal] not-italic relative shrink-0 text-[#46913d] text-[32px] w-full whitespace-pre-wrap">16.999.000 đ</p>
    </div>
  );
}

function Group1() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] relative shrink-0">
      <div className="bg-[#fdfdfd] col-1 h-[413.965px] ml-0 mt-0 rounded-[20px] row-1 w-[378.597px]" />
      <Group26 />
      <Frame15 />
    </div>
  );
}

function Group8() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-[327.02px] mt-[206.29px] relative row-1">
      <div className="col-1 h-[37.714px] ml-0 mt-0 relative row-1 w-[39.933px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 39.9326 37.714">
          <ellipse cx="19.9663" cy="18.857" fill="var(--fill-0, #E9E9E9)" id="Ellipse 1" rx="19.9663" ry="18.857" />
        </svg>
      </div>
      <div className="col-1 ml-[9.85px] mt-[8.74px] relative row-1 size-[20.231px]" data-name="Favorite">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgFavorite} />
      </div>
    </div>
  );
}

function Group25() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-0 mt-0 relative row-1">
      <div className="col-1 h-[252.142px] ml-0 mt-0 relative rounded-[20px] row-1 w-[378.902px]" data-name="image 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[20px] size-full" src={imgImage4} />
      </div>
      <Group8 />
    </div>
  );
}

function Location2() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-0 mt-0 relative row-1" data-name="Location">
      <p className="col-1 font-['Inter:Regular',sans-serif] font-normal h-[20.909px] leading-[normal] ml-[26.08px] mt-[1.73px] not-italic relative row-1 text-[16px] text-black w-[128.094px] whitespace-pre-wrap">TP. Hồ Chí Minh</p>
      <div className="col-1 ml-0 mt-0 relative row-1 size-[20.291px]" data-name="icon map">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgIconMap} />
      </div>
    </div>
  );
}

function Date2() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-[173.46px] mt-[1.56px] relative row-1" data-name="Date">
      <p className="col-1 font-['Inter:Regular',sans-serif] font-normal h-[20.909px] leading-[normal] ml-[23.91px] mt-[0.18px] not-italic relative row-1 text-[16px] text-black w-[128.094px] whitespace-pre-wrap">2020</p>
      <div className="col-1 ml-0 mt-0 relative row-1 size-[17.18px]" data-name="icon calendar">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgIconCalendar} />
      </div>
    </div>
  );
}

function Group11() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <Location2 />
      <Date2 />
    </div>
  );
}

function Frame16() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[13px] items-start ml-[32.6px] mt-[265.55px] relative row-1 w-[327.997px]">
      <p className="font-['Inter:Bold',sans-serif] font-bold h-[27.879px] leading-[normal] not-italic relative shrink-0 text-[28px] text-black w-full whitespace-pre-wrap">Granavol SLE 7</p>
      <Group11 />
      <p className="font-['Inter:Extra_Bold',sans-serif] font-extrabold h-[33.687px] leading-[normal] not-italic relative shrink-0 text-[#46913d] text-[32px] w-full whitespace-pre-wrap">16.999.000 đ</p>
    </div>
  );
}

function Group2() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] relative shrink-0">
      <div className="bg-[#fdfdfd] col-1 h-[413.965px] ml-0 mt-0 rounded-[20px] row-1 w-[378.597px]" />
      <Group25 />
      <Frame16 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex gap-[134px] items-end relative shrink-0">
      <Group />
      <Group1 />
      <Group2 />
    </div>
  );
}

function XeDpNiBt() {
  return (
    <div className="content-end flex flex-wrap gap-[36px_134px] items-end leading-[0] relative shrink-0 w-[1438px]" data-name="Xe đạp nổi bật">
      <Frame1 />
      <Frame9 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[677.621px]">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center not-italic relative shrink-0 text-[38.4px] text-black tracking-[-0.192px]">
        <p className="leading-[1.45]">Xe đạp đã được kiểm định</p>
      </div>
      <div className="flex flex-col font-['Inter:Italic',sans-serif] font-normal italic justify-center relative shrink-0 text-[#3d3d3d] text-[25.6px] text-center tracking-[-0.128px]">
        <p className="leading-[1.45]">Đã được chứng nhận chất lượng bởi đội ngũ chuyên gia</p>
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-[1438px] whitespace-nowrap">
      <Frame5 />
      <div className="flex flex-col font-['Inter:Italic',sans-serif] font-normal italic justify-center relative shrink-0 text-[#009a17] text-[25.6px] text-center tracking-[-0.128px]">
        <p className="leading-[1.45]">{`Xem tất cả >`}</p>
      </div>
    </div>
  );
}

function Group12() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-[327.72px] mt-[206.26px] relative row-1">
      <div className="col-1 h-[37.714px] ml-0 mt-0 relative row-1 w-[39.933px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 39.9326 37.714">
          <ellipse cx="19.9663" cy="18.857" fill="var(--fill-0, #E9E9E9)" id="Ellipse 1" rx="19.9663" ry="18.857" />
        </svg>
      </div>
      <div className="col-1 ml-[9.85px] mt-[8.74px] relative row-1 size-[20.231px]" data-name="Favorite">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgFavorite} />
      </div>
    </div>
  );
}

function Group13() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-[314.6px] mt-[7.49px] relative row-1">
      <div className="col-1 h-[37.008px] ml-[8.07px] mt-[9.13px] relative row-1 w-[39.122px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 39.1222 37.0083">
          <ellipse cx="19.5611" cy="18.5041" fill="var(--fill-0, white)" id="Ellipse 2" rx="19.5611" ry="18.5041" />
        </svg>
      </div>
      <div className="col-1 ml-0 mt-0 relative row-1 size-[55.266px]" data-name="Verified Account">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgVerifiedAccount} />
      </div>
    </div>
  );
}

function Group22() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-0 mt-0 relative row-1">
      <div className="col-1 h-[252.142px] ml-0 mt-0 pointer-events-none relative rounded-[20px] row-1 w-[378.902px]" data-name="image 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[20px] size-full" src={imgImage5} />
        <div aria-hidden="true" className="absolute border-4 border-[#0dbd50] border-solid inset-0 rounded-[20px]" />
      </div>
      <Group12 />
      <Group13 />
    </div>
  );
}

function Location3() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-0 mt-0 relative row-1" data-name="Location">
      <p className="col-1 font-['Inter:Regular',sans-serif] font-normal h-[20.909px] leading-[normal] ml-[26.08px] mt-[1.73px] not-italic relative row-1 text-[16px] text-black w-[128.094px] whitespace-pre-wrap">TP. Hồ Chí Minh</p>
      <div className="col-1 ml-0 mt-0 relative row-1 size-[20.291px]" data-name="icon map">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgIconMap} />
      </div>
    </div>
  );
}

function Date3() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-[173.46px] mt-[1.56px] relative row-1" data-name="Date">
      <p className="col-1 font-['Inter:Regular',sans-serif] font-normal h-[20.909px] leading-[normal] ml-[23.91px] mt-[0.18px] not-italic relative row-1 text-[16px] text-black w-[128.094px] whitespace-pre-wrap">2020</p>
      <div className="col-1 ml-0 mt-0 relative row-1 size-[17.18px]" data-name="icon calendar">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgIconCalendar} />
      </div>
    </div>
  );
}

function Group15() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <Location3 />
      <Date3 />
    </div>
  );
}

function Frame17() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[13px] items-start ml-[32.34px] mt-[265.38px] relative row-1 w-[327.997px]">
      <p className="font-['Inter:Bold',sans-serif] font-bold h-[27.879px] leading-[normal] not-italic relative shrink-0 text-[28px] text-black w-full whitespace-pre-wrap">Granavol SLE 7</p>
      <Group15 />
      <p className="font-['Inter:Extra_Bold',sans-serif] font-extrabold h-[33.687px] leading-[normal] not-italic relative shrink-0 text-[#46913d] text-[32px] w-full whitespace-pre-wrap">16.999.000 đ</p>
    </div>
  );
}

function Group3() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] relative shrink-0">
      <div className="bg-[#fdfdfd] col-1 h-[413.965px] ml-0 mt-0 rounded-[20px] row-1 w-[378.597px]" />
      <Group22 />
      <Frame17 />
    </div>
  );
}

function Group16() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-[327.39px] mt-[206.26px] relative row-1">
      <div className="col-1 h-[37.714px] ml-0 mt-0 relative row-1 w-[39.933px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 39.9326 37.714">
          <ellipse cx="19.9663" cy="18.857" fill="var(--fill-0, #E9E9E9)" id="Ellipse 1" rx="19.9663" ry="18.857" />
        </svg>
      </div>
      <div className="col-1 ml-[9.85px] mt-[8.74px] relative row-1 size-[20.231px]" data-name="Favorite">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgFavorite} />
      </div>
    </div>
  );
}

function Group17() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-[314.28px] mt-[7.49px] relative row-1">
      <div className="col-1 h-[37.008px] ml-[8.07px] mt-[9.13px] relative row-1 w-[39.122px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 39.1222 37.0083">
          <ellipse cx="19.5611" cy="18.5041" fill="var(--fill-0, white)" id="Ellipse 2" rx="19.5611" ry="18.5041" />
        </svg>
      </div>
      <div className="col-1 ml-0 mt-0 relative row-1 size-[55.266px]" data-name="Verified Account">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgVerifiedAccount} />
      </div>
    </div>
  );
}

function Group23() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-0 mt-0 relative row-1">
      <div className="col-1 h-[252.142px] ml-0 mt-0 pointer-events-none relative rounded-[20px] row-1 w-[378.902px]" data-name="image 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[20px] size-full" src={imgImage6} />
        <div aria-hidden="true" className="absolute border-4 border-[#0dbd50] border-solid inset-0 rounded-[20px]" />
      </div>
      <Group16 />
      <Group17 />
    </div>
  );
}

function Location4() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-0 mt-0 relative row-1" data-name="Location">
      <p className="col-1 font-['Inter:Regular',sans-serif] font-normal h-[20.909px] leading-[normal] ml-[26.08px] mt-[1.73px] not-italic relative row-1 text-[16px] text-black w-[128.094px] whitespace-pre-wrap">TP. Hồ Chí Minh</p>
      <div className="col-1 ml-0 mt-0 relative row-1 size-[20.291px]" data-name="icon map">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgIconMap} />
      </div>
    </div>
  );
}

function Date4() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-[173.46px] mt-[1.56px] relative row-1" data-name="Date">
      <p className="col-1 font-['Inter:Regular',sans-serif] font-normal h-[20.909px] leading-[normal] ml-[23.91px] mt-[0.18px] not-italic relative row-1 text-[16px] text-black w-[128.094px] whitespace-pre-wrap">2020</p>
      <div className="col-1 ml-0 mt-0 relative row-1 size-[17.18px]" data-name="icon calendar">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgIconCalendar} />
      </div>
    </div>
  );
}

function Group18() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <Location4 />
      <Date4 />
    </div>
  );
}

function Frame18() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[13px] items-start ml-[32.44px] mt-[265.38px] relative row-1 w-[327.997px]">
      <p className="font-['Inter:Bold',sans-serif] font-bold h-[27.879px] leading-[normal] not-italic relative shrink-0 text-[28px] text-black w-full whitespace-pre-wrap">Granavol SLE 7</p>
      <Group18 />
      <p className="font-['Inter:Extra_Bold',sans-serif] font-extrabold h-[33.687px] leading-[normal] not-italic relative shrink-0 text-[#46913d] text-[32px] w-full whitespace-pre-wrap">16.999.000 đ</p>
    </div>
  );
}

function Group4() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] relative shrink-0">
      <div className="bg-[#fdfdfd] col-1 h-[413.965px] ml-0 mt-0 rounded-[20px] row-1 w-[378.597px]" />
      <Group23 />
      <Frame18 />
    </div>
  );
}

function Group19() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-[327.07px] mt-[206.26px] relative row-1">
      <div className="col-1 h-[37.714px] ml-0 mt-0 relative row-1 w-[39.933px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 39.9326 37.714">
          <ellipse cx="19.9663" cy="18.857" fill="var(--fill-0, #E9E9E9)" id="Ellipse 1" rx="19.9663" ry="18.857" />
        </svg>
      </div>
      <div className="col-1 ml-[9.85px] mt-[8.74px] relative row-1 size-[20.231px]" data-name="Favorite">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgFavorite} />
      </div>
    </div>
  );
}

function Group20() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-[314.95px] mt-[7.49px] relative row-1">
      <div className="col-1 h-[37.008px] ml-[8.07px] mt-[9.13px] relative row-1 w-[39.122px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 39.1222 37.0083">
          <ellipse cx="19.5611" cy="18.5041" fill="var(--fill-0, white)" id="Ellipse 2" rx="19.5611" ry="18.5041" />
        </svg>
      </div>
      <div className="col-1 ml-0 mt-0 relative row-1 size-[55.266px]" data-name="Verified Account">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgVerifiedAccount} />
      </div>
    </div>
  );
}

function Group24() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-0 mt-0 relative row-1">
      <div className="col-1 h-[252.142px] ml-0 mt-0 pointer-events-none relative rounded-[20px] row-1 w-[378.902px]" data-name="image 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[20px] size-full" src={imgImage7} />
        <div aria-hidden="true" className="absolute border-4 border-[#0dbd50] border-solid inset-0 rounded-[20px]" />
      </div>
      <Group19 />
      <Group20 />
    </div>
  );
}

function Location5() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-0 mt-0 relative row-1" data-name="Location">
      <p className="col-1 font-['Inter:Regular',sans-serif] font-normal h-[20.909px] leading-[normal] ml-[26.08px] mt-[1.73px] not-italic relative row-1 text-[16px] text-black w-[128.094px] whitespace-pre-wrap">TP. Hồ Chí Minh</p>
      <div className="col-1 ml-0 mt-0 relative row-1 size-[20.291px]" data-name="icon map">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgIconMap} />
      </div>
    </div>
  );
}

function Date5() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-[173.46px] mt-[1.56px] relative row-1" data-name="Date">
      <p className="col-1 font-['Inter:Regular',sans-serif] font-normal h-[20.909px] leading-[normal] ml-[23.91px] mt-[0.18px] not-italic relative row-1 text-[16px] text-black w-[128.094px] whitespace-pre-wrap">2020</p>
      <div className="col-1 ml-0 mt-0 relative row-1 size-[17.18px]" data-name="icon calendar">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgIconCalendar} />
      </div>
    </div>
  );
}

function Group21() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <Location5 />
      <Date5 />
    </div>
  );
}

function Frame19() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[13px] items-start ml-[32.54px] mt-[265.38px] relative row-1 w-[327.997px]">
      <p className="font-['Inter:Bold',sans-serif] font-bold h-[27.879px] leading-[normal] not-italic relative shrink-0 text-[28px] text-black w-full whitespace-pre-wrap">Granavol SLE 7</p>
      <Group21 />
      <p className="font-['Inter:Extra_Bold',sans-serif] font-extrabold h-[33.687px] leading-[normal] not-italic relative shrink-0 text-[#46913d] text-[32px] w-full whitespace-pre-wrap">16.999.000 đ</p>
    </div>
  );
}

function Group5() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] relative shrink-0">
      <div className="bg-[#fdfdfd] col-1 h-[413.965px] ml-0 mt-0 rounded-[20px] row-1 w-[378.597px]" />
      <Group24 />
      <Frame19 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex gap-[145px] items-center relative shrink-0">
      <Group3 />
      <Group4 />
      <Group5 />
    </div>
  );
}

function XeDpDaDcKimDnh() {
  return (
    <div className="content-end flex flex-wrap gap-[61px_145px] items-end leading-[0] relative shrink-0 w-[1438px]" data-name="Xe đạp đã được kiểm định">
      <Frame4 />
      <Frame10 />
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex flex-col gap-[14px] items-center leading-[normal] relative shrink-0 text-black">
      <p className="font-['Inter:Bold',sans-serif] font-bold not-italic relative shrink-0 text-[57.6px]">Tại sao chọn chúng tôi?</p>
      <p className="font-['Inter:Medium_Italic',sans-serif] font-medium italic relative shrink-0 text-[32.4px]">Cam kết mang đến trải nghiệm mua sắm tốt nhất</p>
    </div>
  );
}

function Frame20() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-center relative shrink-0 w-[371.951px]">
      <div className="relative shrink-0 size-[120px]" data-name="image 4">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage8} />
      </div>
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] min-w-full not-italic relative shrink-0 text-[32px] text-black text-center w-[min-content] whitespace-pre-wrap">Đảm bảo chất lượng</p>
      <p className="font-['Inter:Light_Italic',sans-serif] font-light italic leading-[normal] min-w-full relative shrink-0 text-[24px] text-black text-center w-[min-content] whitespace-pre-wrap">Tất cả xe đạp đều được kiểm tra kỹ lưỡng trước khi bán</p>
    </div>
  );
}

function Frame21() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-center relative shrink-0 w-[374.466px]">
      <div className="relative shrink-0 size-[120px]" data-name="image 5">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage9} />
      </div>
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] min-w-full not-italic relative shrink-0 text-[32px] text-black text-center w-[min-content] whitespace-pre-wrap">Thanh toán an toàn</p>
      <p className="font-['Inter:Light_Italic',sans-serif] font-light italic leading-[normal] min-w-full relative shrink-0 text-[24px] text-black text-center w-[min-content] whitespace-pre-wrap">Nhiều phương thức thanh toán linh hoạt và bảo mật</p>
    </div>
  );
}

function Frame22() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-center relative shrink-0 w-[352.838px]">
      <div className="relative shrink-0 size-[120px]" data-name="image 6">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage10} />
      </div>
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] min-w-full not-italic relative shrink-0 text-[32px] text-black text-center w-[min-content] whitespace-pre-wrap">Hỗ trợ 24/7</p>
      <p className="font-['Inter:Light_Italic',sans-serif] font-light italic leading-[normal] min-w-full relative shrink-0 text-[24px] text-black text-center w-[min-content] whitespace-pre-wrap">Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ</p>
    </div>
  );
}

function Frame23() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-center relative shrink-0 w-[305px]">
      <div className="relative shrink-0 size-[120px]" data-name="image 7">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage11} />
      </div>
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] min-w-full not-italic relative shrink-0 text-[32px] text-black text-center w-[min-content] whitespace-pre-wrap">Giá tốt nhất</p>
      <p className="font-['Inter:Light_Italic',sans-serif] font-light italic leading-[normal] min-w-full relative shrink-0 text-[24px] text-black text-center w-[min-content] whitespace-pre-wrap">Cam kết giá cả cạnh tranh và minh bạch</p>
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex gap-[62px] items-start relative shrink-0">
      <Frame20 />
      <Frame21 />
      <Frame22 />
      <Frame23 />
    </div>
  );
}

function TiSaoChnChungToi() {
  return (
    <div className="bg-[#eee] content-stretch flex flex-col gap-[50px] items-center px-[59px] py-[30px] relative shrink-0 w-[1728px]" data-name="Tại sao chọn chúng tôi">
      <Frame11 />
      <Frame12 />
    </div>
  );
}

function Body() {
  return (
    <div className="content-stretch flex flex-col gap-[80px] items-center relative shrink-0 w-full" data-name="Body">
      <Banner />
      <XeDpNiBt />
      <div className="h-[456.201px] relative shrink-0 w-[1230.204px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgRectangle32} />
        </div>
      </div>
      <XeDpDaDcKimDnh />
      <TiSaoChnChungToi />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#2e8b57] text-[18px] whitespace-nowrap">
        <p className="leading-[28px]">Chợ Xe Đạp</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="Container">
      <div className="h-[70px] relative shrink-0 w-[76px]" data-name="anhavatarvuong 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgAnhavatarvuong2} />
      </div>
      <Container4 />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[20px] not-italic relative shrink-0 text-[#6b7280] text-[14px] w-full whitespace-pre-wrap">
        <p className="mb-0">Sàn thương mại điện tử chuyên biệt về xe đạp hàng</p>
        <p>đầu Việt Nam. Kết nối đam mê, giao dịch an toàn.</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] h-full items-start min-h-px min-w-px relative" data-name="Container">
      <Container3 />
      <Container5 />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#1f2937] text-[16px] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">Về chúng tôi</p>
      </div>
    </div>
  );
}

function Component() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Component 1">
      <div className="flex flex-[1_0_0] flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#6b7280] text-[0px]">
        <a className="block cursor-pointer leading-[20px] text-[14px] whitespace-pre-wrap" href="http://localhost:5770/code.html">
          Giới thiệu
        </a>
      </div>
    </div>
  );
}

function Item() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <Component />
    </div>
  );
}

function Component1() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Component 1">
      <div className="flex flex-[1_0_0] flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#6b7280] text-[0px]">
        <a className="block cursor-pointer leading-[20px] text-[14px] whitespace-pre-wrap" href="http://localhost:5770/code.html">
          Quy chế hoạt động
        </a>
      </div>
    </div>
  );
}

function Item1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <Component1 />
    </div>
  );
}

function Component2() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Component 1">
      <div className="flex flex-[1_0_0] flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#6b7280] text-[0px]">
        <a className="block cursor-pointer leading-[20px] text-[14px] whitespace-pre-wrap" href="http://localhost:5770/code.html">
          Chính sách bảo mật
        </a>
      </div>
    </div>
  );
}

function Item2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <Component2 />
    </div>
  );
}

function Component3() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Component 1">
      <div className="flex flex-[1_0_0] flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#6b7280] text-[0px]">
        <a className="block cursor-pointer leading-[20px] text-[14px] whitespace-pre-wrap" href="http://localhost:5770/code.html">
          Giải quyết tranh chấp
        </a>
      </div>
    </div>
  );
}

function Item3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <Component3 />
    </div>
  );
}

function List() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="List">
      <Item />
      <Item1 />
      <Item2 />
      <Item3 />
    </div>
  );
}

function Container6() {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Container">
      <div className="content-stretch flex flex-col gap-[16px] items-start pl-[45px] relative size-full">
        <Heading />
        <List />
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#1f2937] text-[16px] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">Hỗ trợ khách hàng</p>
      </div>
    </div>
  );
}

function Component4() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Component 1">
      <div className="flex flex-[1_0_0] flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#6b7280] text-[0px]">
        <a className="block cursor-pointer leading-[20px] text-[14px] whitespace-pre-wrap" href="http://localhost:5770/code.html">
          Trung tâm trợ giúp
        </a>
      </div>
    </div>
  );
}

function Item4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <Component4 />
    </div>
  );
}

function Component5() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Component 1">
      <div className="flex flex-[1_0_0] flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#6b7280] text-[0px]">
        <a className="block cursor-pointer leading-[20px] text-[14px] whitespace-pre-wrap" href="http://localhost:5770/code.html">
          An toàn mua bán
        </a>
      </div>
    </div>
  );
}

function Item5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <Component5 />
    </div>
  );
}

function Component6() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Component 1">
      <div className="flex flex-[1_0_0] flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#6b7280] text-[0px]">
        <a className="block cursor-pointer leading-[20px] text-[14px] whitespace-pre-wrap" href="http://localhost:5770/code.html">
          Liên hệ hỗ trợ
        </a>
      </div>
    </div>
  );
}

function Item6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <Component6 />
    </div>
  );
}

function Component7() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Component 1">
      <div className="flex flex-[1_0_0] flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#6b7280] text-[0px]">
        <a className="block cursor-pointer leading-[20px] text-[14px] whitespace-pre-wrap" href="http://localhost:5770/code.html">
          Tuyển dụng
        </a>
      </div>
    </div>
  );
}

function Item7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Item">
      <Component7 />
    </div>
  );
}

function List1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="List">
      <Item4 />
      <Item5 />
      <Item6 />
      <Item7 />
    </div>
  );
}

function Container7() {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Container">
      <div className="content-stretch flex flex-col gap-[16px] items-start pl-[45px] relative size-full">
        <Heading1 />
        <List1 />
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col h-[24px] items-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#1f2937] text-[16px] whitespace-nowrap">
        <p className="leading-[24px]">Kết nối</p>
      </div>
    </div>
  );
}

function SocialLink() {
  return (
    <button className="block relative shrink-0 size-[24px]" data-name="Social link 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g clipPath="url(#clip0_1_361)" id="Social link 1">
          <path d={svgPaths.p3c382d72} fill="var(--fill-0, black)" fillOpacity="0.45" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_361">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </button>
  );
}

function SocialLink1() {
  return (
    <button className="block relative shrink-0 size-[24px]" data-name="Social link 2">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g clipPath="url(#clip0_1_358)" id="Social link 2">
          <g id="Vector">
            <path clipRule="evenodd" d={svgPaths.p1fcf5070} fill="black" fillOpacity="0.45" fillRule="evenodd" />
            <path d={svgPaths.pe7ea00} fill="var(--fill-0, white)" />
            <path d={svgPaths.p1ab31680} fill="var(--fill-0, white)" />
            <path d={svgPaths.p28c6df0} fill="var(--fill-0, white)" />
          </g>
        </g>
        <defs>
          <clipPath id="clip0_1_358">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </button>
  );
}

function SocialLink2() {
  return (
    <button className="block relative shrink-0 size-[24px]" data-name="Social link 3">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Social link 3">
          <path d={svgPaths.pdaf0200} fill="var(--fill-0, black)" fillOpacity="0.45" id="Vector" />
        </g>
      </svg>
    </button>
  );
}

function SocialLinks() {
  return (
    <nav className="content-stretch cursor-pointer flex gap-[16px] items-center relative shrink-0" data-name="Social links">
      <SocialLink />
      <SocialLink1 />
      <SocialLink2 />
    </nav>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col h-[20px] items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">Hotline: 1900 1234</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col h-[20px] items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">Email: support@choxedap.vn</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col gap-[17px] h-full items-start pl-[45px] relative shrink-0 w-[344px]" data-name="Container">
      <Heading2 />
      <SocialLinks />
      <Container9 />
      <Container10 />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute content-stretch flex gap-[32px] h-[144px] items-start justify-center left-[32px] top-[21px] w-[1472px]" data-name="Container">
      <Container2 />
      <Container6 />
      <Container7 />
      <Container8 />
    </div>
  );
}

function Container11() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[14px] text-center whitespace-nowrap">
          <p className="leading-[20px]">© 2023 Chợ Xe Đạp. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

function Component8() {
  return (
    <div className="content-stretch flex flex-col items-center relative self-stretch shrink-0" data-name="Component 1">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[0px] text-center whitespace-nowrap">
        <a className="block cursor-pointer leading-[20px] text-[14px]" href="http://localhost:5770/code.html">
          Chính sách
        </a>
      </div>
    </div>
  );
}

function Component9() {
  return (
    <div className="content-stretch flex flex-col items-center relative self-stretch shrink-0" data-name="Component 1">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[0px] text-center whitespace-nowrap">
        <a className="block cursor-pointer leading-[20px] text-[14px]" href="http://localhost:5770/code.html">
          Điều khoản
        </a>
      </div>
    </div>
  );
}

function Component10() {
  return (
    <div className="content-stretch flex flex-col items-center relative self-stretch shrink-0" data-name="Component 1">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[0px] text-center whitespace-nowrap">
        <a className="block cursor-pointer leading-[20px] text-[14px]" href="http://localhost:5770/code.html">
          Hỗ trợ
        </a>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-start relative">
        <Component8 />
        <Component9 />
        <Component10 />
      </div>
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="absolute content-stretch flex gap-[984.19px] h-[52px] items-center justify-center left-[-95.5px] pt-[25px] top-[205px] w-[1727px]" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-solid border-t inset-0 pointer-events-none" />
      <Container11 />
      <Container12 />
    </div>
  );
}

function Container() {
  return (
    <div className="h-[278px] max-w-[1536px] relative shrink-0 w-[1536px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container1 />
        <HorizontalBorder />
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-center pb-[48px] pt-[49px] relative shrink-0 w-full" data-name="Footer">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-solid border-t inset-0 pointer-events-none" />
      <Container />
    </div>
  );
}

function Chatbot() {
  return (
    <div className="absolute bg-[#ef4444] content-stretch flex items-center justify-center left-[1627.93px] overflow-clip p-[15.6px] rounded-[12998.701px] size-[62.4px] top-[3326.92px]" data-name="Chatbot">
      <p className="flex-[1_0_0] font-['Material_Icons:Regular',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[31.2px] text-center text-white whitespace-pre-wrap">chat_bubble</p>
    </div>
  );
}

export default function F() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-px items-start relative size-full" data-name="F1-0">
      <Header />
      <Body />
      <Footer />
      <Chatbot />
    </div>
  );
}