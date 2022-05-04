import React, {Component} from 'react';

import {StyleSheet, View, FlatList, TouchableOpacity, Text} from 'react-native';
import {DEVICE_HEIGHT, DEVICE_WIDTH} from '../constants/constants';
import Check from '../assets/svg/check.svg';
import {ScrollView} from 'react-native-gesture-handler';

export default class Terms extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  onPressType = (type) => {
    const {onPressSort, cancel} = this.props;
    onPressSort(type);
    cancel();
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Terms</Text>
        <ScrollView>
          <Text style={styles.text1}>
            Hello, and welcome to the Christian Music Hub Terms and Conditions
            of Use (“Terms”). The Terms you see below are important because
            they:{'\n'}
            {'\n'} • Outline your legal rights on Christian Music Hub {'\n'}
            {'\n'}• Explain the rights you give to us when you use Christian
            Music Hub
            {'\n'}
            {'\n'}• Describe the rules everyone needs to follow when using
            Christian Music Hub {'\n'}
            {'\n'}• Contain a class action waiver and an agreement on how to
            resolve any disputes that may arise by arbitration Please read these
            Terms, our Privacy Policy and any other terms referenced in this
            document carefully. We hope you’re sitting comfortably and listening
            to some great music.{'\n'}
            {'\n'}
            {'\n'}
            1. Introduction{'\n'}
            {'\n'} Thanks for choosing Christian Music Hub (“Christian Music
            Hub,” “the hub,” we,” “us,” “our”). Christian Music Hub provides
            personalised services with social and interactive features for
            streaming music and other content as well as other products and
            services that may be developed from time to time. By signing up or
            otherwise using any of the hub’s services, including all associated
            features and functionalities, websites and user interfaces, as well
            as all content and software applications associated with our
            services (collectively, the “Christian Music Hub Service” or
            “Service”), or accessing any music, videos or other content or
            material that is made available through the Service (the “Content”)
            you are entering into a binding contract with the Christian Music
            Hub entity indicated in Section 25 (Contact Us).{'\n'}
            {'\n'} Your agreement with us includes these Terms and any
            additional terms that you agree to, as discussed in the Entire
            Agreement section below, other than terms with any third parties
            (collectively, the “Agreements”). The Agreements include terms
            regarding future changes to the Agreements, export controls,
            automatic renewals, limitations of liability, privacy, waiver of
            class actions, and resolution of disputes by arbitration instead of
            in court. If you wish to review the terms of the Agreements, the
            current effective version of the Agreements can be found on
            Christian Music Hub’s website. You acknowledge that you have read
            and understood the Agreements, accept these Agreements, and agree to
            be bound by them. If you don’t agree with (or cannot comply with)
            the Agreements, then you may not use the Christian Music Hub Service
            or access any Content.
            {'\n'}
            {'\n'}
            In order to use the Christian Music Hub Service and access any
            Content, you need to (1) meet the age requirements in the chart
            below, (2) have the power to enter a binding contract with us and
            not be barred from doing so under any applicable laws, and (3)
            reside in a country where Service is available. You also promise
            that any registration information that you submit to Christian Music
            Hub is true, accurate, and complete, and you agree to keep it that
            way at all times. 2. Changes to the Agreements Occasionally we may
            make changes to the Agreements for valid reasons, such as improving
            the existing functions or features or adding new functions or
            features to the Service, implementing advancements in science and
            technology, and reasonable technical adjustments to the Service,
            ensuring the operability or the security of the Service, and for
            legal or regulatory reasons. When we make material changes to the
            Agreements, we’ll provide you with notice as appropriate under the
            circumstances, e.g., by displaying a prominent notice or seeking
            your agreement within the Service or by sending you an email. In
            some cases, we will notify you in advance, and your continued use of
            the Service after the changes have been made will constitute your
            acceptance of the changes. Please therefore make sure you read any
            such notice carefully. If you do not wish to continue using the
            Service under the new version of the Agreements, you may terminate
            your account by contacting us. If you received a Trial or a Paid
            Subscription through a third party, you must cancel the applicable
            Paid Subscription through such third party. 3. Enjoying Christian
            Music Hub Here’s some information about all the ways you can enjoy
            Christian Music Hub. 3.1. Service Options You can find a description
            of our Service options on our website, and we will explain which
            Service options are available to you when you create a Christian
            Music Hub account. Certain options are provided to you
            free-of-charge. The Christian Music Hub Service that does not
            require payment is currently referred to as the “Free Service.”
            Other options require payment before you can access them (the “Paid
            Subscriptions”). We may also offer special promotional plans,
            memberships, or services, including offerings of third-party
            products and services in conjunction with or through the Christian
            Music Hub Service. We are not responsible for the products and
            services provided by such third parties. We reserve the right to
            modify, terminate or otherwise amend our offered subscription plans
            and promotional offerings at any time in accordance with these
            Terms. The Unlimited Service may not be available to all users. We
            will explain which services are available to you when you are
            signing up for the services. If you cancel your subscription to the
            Unlimited Service, or if your subscription to the Unlimited Service
            is interrupted (for example, if you change your payment details),
            you may not be able to re-subscribe for the Unlimited Service. Note
            that the Unlimited Service may be discontinued in the future, in
            which case you will no longer be charged for the Service. If you
            have purchased or received a code, gift card, pre-paid offer or
            other offer provided or sold by or on behalf of Christian Music Hub
            for access to a Paid Subscription (“Code”), separate terms and
            conditions presented to you along with the Code may also apply to
            your access to the Service and you agree to comply with any such
            terms and conditions. You may also purchase access to a Paid
            Subscription through a third party. In such cases, separate terms
            and conditions with such third party in addition to the Agreements
            may apply to your access to the Service. 3.2. Trials Note that
            Christian Music Hub does not engage in trial versions. 4. Payments,
            cancellations, and cooling off 4.1. Billing You may purchase a Paid
            Subscription directly from Christian Music Hub or through a third
            party either by (1) paying a subscription fee in advance on a
            monthly basis or some other recurring interval disclosed to you
            prior to your purchase; or (2) pre-payment giving you access to the
            Christian Music Hub Service for a specific time period (“Pre-Paid
            Period”). Christian Music Hub may change the price for the Paid
            Subscriptions, including recurring subscription fees, the Pre-Paid
            Period (for periods not yet paid), or Codes, from time to time and
            will communicate any price changes to you in advance and, if
            applicable, how to accept those changes. Price changes will take
            effect at the start of the next subscription period following the
            date of the price change. Subject to applicable law, you accept the
            new price by continuing to use the Christian Music Hub Service after
            the price change takes effect. If you do not agree with a price
            change, you have the right to reject the change by unsubscribing
            from the Paid Subscription prior to the price change going into
            effect. If you purchase a Paid Subscription with no Trial, you
            authorize Christian Music Hub to charge you automatically each year
            until you cancel. 4.2. Renewal; Cancellation Unless your Paid
            Subscription has been purchased for a Pre-Paid Period, your payment
            to Christian Music Hub or the third party through which you
            purchased the Paid Subscription will automatically renew at the end
            of the applicable subscription period, unless you cancel your Paid
            Subscription before the end of the then-current subscription period
            by clicking here if you purchased the Paid Subscription through
            Christian Music Hub, or if you purchased the Paid Subscription
            through a third party, by canceling the Paid Subscription through
            such third party. The cancellation will take effect the day after
            the last day of the current subscription period, and you will be
            downgraded to the Free Service. If you purchased your Paid
            Subscription through Christian Music Hub and you cancel your payment
            or Paid Subscription and/or terminate any of the Agreements (1)
            after the Coolingoff Period is over (where applicable), or (2)
            before the end of the current subscription period, we will not
            refund any subscription fees already paid to us. If you wish to
            receive a full refund of all monies paid to Christian Music Hub
            before the Cooling-off Period is over, you must contact Customer
            Support. When we process any refund, we will refund amounts using
            the method you used for payment.
          </Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2d2f34',
    height: DEVICE_HEIGHT * 0.9,
    borderRadius: DEVICE_HEIGHT * 0.02,
    paddingHorizontal: DEVICE_WIDTH * 0.06,
  },
  row: {
    flexDirection: 'row',
    marginLeft: DEVICE_WIDTH * 0.05,
    marginBottom: DEVICE_HEIGHT * 0.04,
  },
  header: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Montserrat-Bold',
    marginBottom: DEVICE_HEIGHT * 0.05,
    marginTop: DEVICE_HEIGHT * 0.03,
  },
  text1: {
    fontSize: DEVICE_WIDTH * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    lineHeight: DEVICE_HEIGHT * 0.03,
  },
});
