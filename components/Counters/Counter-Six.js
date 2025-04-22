import CounterData from "../../data/elements/counter.json";

import CounterHead from "./Counter-Head";
import CounterWrap from "./CounterWrap";

const CounterSix = ({ head }) => {
  return (
    <>
      {CounterData &&
        CounterData.counterSix.map((data, index) => (
          <div className="container" key={index}>
            {head == undefined ? (
              <CounterHead
                bgClass="bg-primary-opacity"
                mb="mb--40"
                tag={data.tag}
                title={data.title}
                subTitle={data.subTitle}
                desc={data.desc}
              />
            ) : (
              ""
            )}

            <div className="row g-5">
              {data.body.map((item, innerIndex) => (
                <div
                  className="col-lg-4 col-md-6 col-sm-6 col-12"
                  key={innerIndex}
                >
                  <div className="rbt-counterup style-3">
                    <div className="inner">
                      <div className="content">
                        <h2 className="counter">
                          <span className="odometer">
                            <CounterWrap value={item.num} format="(d)" />
                          </span>
                        </h2>
                        <span className="subtitle">{item.text}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </>
  );
};

export default CounterSix;
