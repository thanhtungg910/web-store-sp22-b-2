import lodash, { includes } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Pagination, PaginationItem } from "@mui/material";
import Stack from "@mui/material/Stack";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BasicBreadcrumbs from "../../components/common/BasicBreadcrumbs";
import Filters from "../../features/Filters";
import Product from "../../components/product/Product";
import AccordionProduct from "../../components/product/Accordion ";
import Flexs from "../../components/layouts/Flexs";
import Grids from "../../components/layouts/Grids";
import { getProducts } from "../../api/products";
import IProducts from "../../interfaces/products";
import { getCategories, getProductsByCategory, searchProductsBySlug } from "../../api/categories";
import { Box } from "@mui/system";
import useQuery from "../../hooks/useQuery";
import { Link } from "react-router-dom";

const ProductsPage: React.FC = () => {
	const [toggle, setToggle] = useState<boolean>(false);
	const [data, setData] = useState<IProducts[]>([]);
	const [url, setUrl] = useState<any>("");
	const [query, setQuery] = useState<String>("");
	const [categories, setCategories] = useState<[]>([]);
	const [total, setTotal] = useState<Number | number>(0);
	const [search, textSearch] = useState(null);

	const navigate = useNavigate();
	const local = useLocation();
	const path = local.pathname;
	const quer = useQuery();
	const page = quer.get("page") || 0;
	const order: string = quer.get("order") || "DESC";
	useEffect(() => {
		getCategories().then(({ data }) => setCategories(data));
		if (!local.pathname) return;
		const fetchproducts = async () => {
			const {
				data: { products, countDoc },
			} = await getProducts(+page, 8, order);
			setTotal(countDoc);
			setData(products);
			return;
		};
		fetchproducts();
		if (search) {
			const handleSearch = async () => {
				const path = local.pathname;
				const {
					data: { products, countDoc },
				} = await searchProductsBySlug(path, search, +page, 8);
				setTotal(countDoc);
				setData(products);
			};
			handleSearch();
			return;
		}
		if (path != "/products") {
			const getProductsByCate = async () => {
				const {
					data: { products, countDoc },
				} = await getProductsByCategory(path, +page);
				setTotal(countDoc);
				setData(products);
			};
			getProductsByCate();
		}
	}, [local, search]);

	const handleChangeUrl = (e: string) => {
		navigate(e);
	};

	const debounceFn = useCallback(
		lodash.debounce(async function handleDebounceFn(text) {
			textSearch(text);
		}, 1000),
		[]
	);
	return (
		<div>
			<BasicBreadcrumbs />
			<Filters
				categories={categories}
				setCategories={handleChangeUrl}
				toggle={toggle}
				onClick={setToggle}
				pathname={local.pathname}
				total={total}
			/>
			<Flexs className="px-10 my-10">
				{!toggle && (
					<div className="w-[30%] transition-all">
						<AccordionProduct query={query} setQuery={setQuery} debounceFn={debounceFn} />
					</div>
				)}
				<Box className="w-full">
					<Grids className="col-span-2 ">
						{data &&
							data.length > 0 &&
							data.map((item, index) => (
								<Product
									key={index}
									title={item.title}
									price={item.price}
									saleoff={item.saleoff}
									options={item.options}
									image={item.image}
									albums={item.albums}
									slug={item.slug}
								/>
							))}
					</Grids>
					<Stack
						spacing={2}
						sx={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							marginTop: 2,
						}}
					>
						<Pagination
							count={Math.ceil(+total / 8)}
							page={+page}
							renderItem={(item) => (
								<PaginationItem
									components={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
									component={Link}
									to={`${item.page === 1 ? "" : `?page=${item.page}`}`}
									{...item}
								/>
							)}
						/>
					</Stack>
				</Box>
			</Flexs>
		</div>
	);
};

export default ProductsPage;
