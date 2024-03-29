import React from "react";
import axios from 'axios';
import {CountryRegionData, getUnion} from '../components/countries';

// reactstrap components
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Form,
    FormGroup,
    Input,
    Modal,
    Container,
    Col,
    Row
} from "reactstrap";

// core components
import TransparentFooter from "../components/Footers/TransparentFooter.js";

class SocialSecurityTool extends React.Component {
    constructor() {
        super();

        this.state = {
            modalOpen: false,
            waitingResult: false,
            result: {},
            countries: [],
            residency: [{
                country: "Netherlands"
            }],
            workplaces: [{
                location: "Netherlands",
                union: "EU",
                employment: "Employee",
                hours: "40"
            }]
        };

        // Setup the countries list
        this.state.countries = CountryRegionData.map(country => country[0]);

        // Bring in front nl, be, de and separator. Remove the duplicates
        this.state.countries = [...["Netherlands", "Belgium", "Germany", "---"], ...this.state.countries];

    }

    toggleModal = (toggle) => {
        toggle = toggle === true;
        this.setState({modalOpen: toggle});
    };

    handleAddWorkplace = () => {
        this.setState({
            workplaces: this.state.workplaces.concat([{
                location: "Netherlands",
                union: "EU",
                employment: "Employee",
                hours: "40"
            }])
        });
    };

    handleRemoveWorkplace = idx => () => {
        if (idx > 0)
            this.setState({
                workplaces: this.state.workplaces.filter((s, sidx) => idx !== sidx)
            });
    };

    handleWorkplaceChange = idx => evt => {
        const newWorkplaces = this.state.workplaces.map((workplace, sidx) => {
            if (idx !== sidx) return workplace;

            if (evt.target.name === "hours") return {...workplace, hours: evt.target.value};
            if (evt.target.name === "location") return {...workplace, location: evt.target.value, union: getUnion(evt.target.value)};
            if (evt.target.name === "employment") return {...workplace, employment: evt.target.value};
        });

        this.setState({workplaces: newWorkplaces});
    };

    handleResidencyChange = evt => {
        this.setState({
                residency: {country: evt.target.value}
        });
    };

    handleSubmit = e => {
        e.preventDefault();

        this.setState({waitingResult: true});

        axios.post('https://social-security-tool-function.azurewebsites.net/api/SocialSecurity?code=XLsiFV0n/eg2saa6wibILDRJTvKIErSMrWVVhEctA3xRwEPbm3LcmA==', {
            residency: this.state.residency,
            workplaces: this.state.workplaces
        }).then(res => {
            console.log(res.data);
            this.setState({
                result: {
                    type: res.data.type,
                    country: res.data.country
                }
            })
            this.toggleModal(true);
            this.setState({waitingResult: false});
        }).catch(error => {
            console.log(error);
            this.setState({
                result: {
                    type: 'error'
                }
            });
            this.toggleModal(true);
            this.setState({waitingResult: false});
        });
    };



    render() {
        return (
            <div className="page-header clear-filter" filter-color="orange">
                <div className="content mt-5 mb-0">
                    <Container>
                        <Col className="ml-auto mr-auto" md="6">
                            <Card className="pl-3 pr-3">
                                <Form onSubmit={this.handleSubmit} className="form" method="">
                                    <CardHeader className="text-center">
                                    <p className="text-black mt-4">
                                            The tool below assists you in determining in which country you will be obliged to pay social security payments. Provide the information in the fields and click on <b>Get Result</b>.
                                            </p>
                                    </CardHeader>

                                    <CardBody>
                                        <Modal isOpen={this.state.modalOpen}>
                                            <div className="modal-header">
                                                <h5 className="modal-title">Social Security Tool</h5>
                                                <button
                                                    aria-label="Close"
                                                    className="close"
                                                    onClick={this.toggleModal}
                                                    type="button"
                                                >
                                                    <span aria-hidden={true}>×</span>
                                                </button>
                                            </div>
                                            <div className="modal-body">
                                                <p>
                                                    {
                                                    this.state.result.type === "country" ? `You have to pay social security in `: 
                                                    this.state.result.type === "legislation" ? `For more information please check the legislation in ` :
                                                    this.state.result.type === "error" ? `There is a problem with the server. Please try again later` :
                                                    `This case is not recognized yet`
                                                    }

                                                    {this.state.result.country === "Netherlands" ? `the ` : ``}

                                                    <b>{this.state.result.country}</b>!

                                                    More information about the social security system can be found at{" "}
                                                    <a href="https://www.grensinfo.nl/gip/nl/index.jsp" target="_blank">Grensinfopunt</a>.
                                                </p>
                                            </div>
                                            <div className="modal-footer">
                                                <Button color="secondary"  type="button" color="primary" onClick={this.toggleModal}>
                                                    Close
                                                </Button>
                                            </div>
                                        </Modal>


                                        {/*RESIDENCY GROUP*/}
                                        <p className="text-black text-uppercase">Residency</p>
                                        <FormGroup
                                            className={
                                                "no-border input-lg"
                                            }
                                        >
                                            <label className="w-100 text-left text-black text-uppercase"
                                                   htmlFor="residency">
                                                Country of Residence
                                            </label>
                                            <Input ref="residency" type="select" onChange={this.handleResidencyChange}>
                                                {
                                                    this.state.countries.map(country => {
                                                        return country === "---" ?
                                                            <option disabled>{country}</option> :
                                                            <option>{country}</option>
                                                    })
                                                }
                                            </Input>
                                        </FormGroup>

                                        {/*WORK GROUP*/}
                                        <p className="text-black text-uppercase mt-5 mb-0">Work place</p>
                                        <Button className="btn-link" color="primary"
                                                onClick={this.handleAddWorkplace}>
                                            <i className="now-ui-icons ui-1_simple-add text-black"/>
                                        </Button>
                                        <Button className="btn-link" color="primary"
                                                onClick={this.handleRemoveWorkplace(this.state.workplaces.length - 1)}>
                                            <i className="now-ui-icons ui-1_simple-delete text-black"/>
                                        </Button>

                                        {this.state.workplaces.map((workplace, idx) => (

                                            <div className="workplace">
                                                <FormGroup className={"no-border input-lg"}>
                                                    <label className="w-100 text-left text-black text-uppercase"
                                                           htmlFor="job-location">
                                                        {`Location Employer #${idx + 1}`}
                                                    </label>
                                                    <Input
                                                        name="location"
                                                        onChange={this.handleWorkplaceChange(idx)}
                                                        type="select"
                                                    >
                                                        {
                                                            this.state.countries.map(country => {
                                                                return country === "---" ?
                                                                    <option disabled>{country}</option> :
                                                                    <option>{country}</option>
                                                            })
                                                        }
                                                    </Input>
                                                </FormGroup>
                                                <FormGroup className={"no-border input-lg"}>

                                                    <Row>
                                                        <div className="col">
                                                            <label
                                                                className="w-100 text-left text-black text-uppercase"
                                                                htmlFor="type">
                                                                Type
                                                            </label>
                                                            <Input
                                                                name="employment"
                                                                onChange={this.handleWorkplaceChange(idx)}
                                                                type="select"
                                                            >
                                                                <option>Employee</option>
                                                                <option>Civil servant</option>
                                                                <option>Self-employed</option>
                                                            </Input>
                                                        </div>
                                                        <div className="col">
                                                            <label
                                                                className="w-100 text-left text-black text-uppercase"
                                                                htmlFor="more">
                                                                Hours
                                                            </label>
                                                            <Input
                                                                name="hours"
                                                                onChange={this.handleWorkplaceChange(idx)}
                                                                placeholder={`eg: 40`}
                                                                type="number"
                                                                min = "0"
                                                                max="100"
                                                            />
                                                        </div>
                                                    </Row>
                                                </FormGroup>
                                            </div>
                                        ))}

                                    </CardBody>
                                    <CardFooter className="text-center">
                                        <Button
                                            block
                                            className="btn-round"
                                            color="primary"
                                            type="submit"
                                            size="lg"
                                        >
                                            {this.state.waitingResult ? <i className="now-ui-icons loader_refresh spin text-white"/> : <span className={"text-uppercase"}>Get result</span>}
                                        </Button>
                                    </CardFooter>
                                </Form>
                            </Card>
                        </Col>
                    </Container>
                </div>
                <TransparentFooter />
            </div>
        );
    }
}

export default SocialSecurityTool;
