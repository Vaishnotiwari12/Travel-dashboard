import {Link, useLocation} from "react-router";
import {cn, getFirstWord} from "~/lib/utils";
import {ChipDirective, ChipListComponent, ChipsDirective} from "@syncfusion/ej2-react-buttons";

interface TripCardProps {
    id: string;
    name: string;
    location: string;
    imageUrl: string;
    tags: string[];
    price: string;
}

export default function TripCard({ id, name, location, imageUrl, tags, price }: TripCardProps) {
    const path = useLocation();

    return (
        <Link to={path.pathname === '/' || path.pathname.startsWith('/travel') ? `/travel/${id}` : `/trips/${id}`} className="trip-card">
            <img 
                src={imageUrl} 
                alt={name} 
                onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = '/assets/images/default-trip.jpg';
                }}
            />

            <article>
                <h2>{name}</h2>
                <figure>
                    <img
                        src="/assets/images/david.webp"
                        alt="user"
                        className="size-4 rounded-full aspect-square"
                    />
                    <p className="text-xs font-normal text-white">{tags.length} activities</p>
                </figure>
            </article>

            <div className="mt-5 pl-[18px] pr-3.5 pb-5">
                <ChipListComponent id="travel-chip">
                    <ChipsDirective>
                        {tags?.map((tag, index) => (
                            <ChipDirective
                                key={index}
                                text={getFirstWord(tag)}
                                cssClass={cn(index===1
                                ? '!bg-pink-50 !text-pink-500'
                                : '!bg-success-50 !text-success-700')}
                            />
                        ))}
                    </ChipsDirective>
                </ChipListComponent>
            </div>

            <article className="tripCard-pill">${price}</article>
        </Link>
    );
}